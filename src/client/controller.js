import EventEmitter from 'eventemitter3';
import memoize from 'lodash.memoize';

const layoutPadding = 10;
const animationDuration = 500;
const easing = 'ease';

// search parameters
const minMetricValue = 0.25; // filter out nodes from search results if they have total scores lower than this
const minSimilarityValue = 0; // only include in total metric if the individual sim val is on [0.5, 1]

const delayPromise = duration => new Promise(resolve => setTimeout(resolve, duration));

const getOrgPos = n => Object.assign({}, n.data('orgPos'));

class Controller {
  constructor({ cy }){
    this.cy = cy;
    this.bus = new EventEmitter();
    this.menu = false;
    this.nodes = cy.nodes();
    this.searchMatchNodes = cy.collection();
  }

  isMenuOpen(){
    return this.menu;
  }

  openMenu(){
    this.menu = true;

    this.bus.emit('openMenu');
    this.bus.emit('toggleMenu', true);
  }

  closeMenu(){
    this.menu = false;

    this.bus.emit('closeMenu');
    this.bus.emit('toggleMenu', false);
  }

  toggleMenu(){
    if( this.isMenuOpen() ){
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  isInfoShown(){
    return this.infoNode != null;
  }

  showInfo(node){
    this.infoNode = node;

    this.bus.emit('showInfo', node);
  }

  hideInfo(){
    this.bus.emit('hideInfo', this.infoNode);

    this.infoNode = null;
  }

  hasHighlight(){
    return this.lastHighlighted != null;
  }

  highlight(node){
    const { cy } = this;

    if( this.highlightInProgress ){ return Promise.resolve(); }

    this.highlightInProgress = true;

    const allEles = cy.elements();
    const nhood = this.lastHighlighted = node.closedNeighborhood();
    const others = this.lastUnhighlighted = allEles.not( nhood );

    const showOverview = () => {
      cy.batch(() => {
        allEles.removeClass('faded highlighted hidden');

        nhood.addClass('highlighted');
        others.addClass('hidden');

        others.positions(getOrgPos);
      });

      const layout = nhood.layout({
        name: 'preset',
        positions: getOrgPos,
        fit: true,
        animate: true,
        animationDuration: animationDuration,
        animationEasing: easing,
        padding: layoutPadding
      });

      layout.run();

      return layout.promiseOn('layoutstop');
    };

    const runLayout = () => {
      const p = getOrgPos(node);

      const layout = nhood.layout({
        name: 'concentric',
        fit: true,
        animate: true,
        animationDuration: animationDuration,
        animationEasing: easing,
        boundingBox: {
          x1: p.x - 1,
          x2: p.x + 1,
          y1: p.y - 1,
          y2: p.y + 1
        },
        avoidOverlap: true,
        concentric: function( ele ){
          if( ele.same( node ) ){
            return 2;
          } else {
            return 1;
          }
        },
        levelWidth: () => { return 1; },
        padding: layoutPadding
      });

      const promise = layout.promiseOn('layoutstop');

      layout.run();

      return promise;
    };

    const showOthersFaded = () => {
      cy.batch(() => {
        others.removeClass('hidden').addClass('faded');
      });
    };

    this.bus.emit('highlight', node);

    return (
      Promise.resolve()
      .then( showOverview )
      .then( () => delayPromise(animationDuration) )
      .then( runLayout )
      .then( showOthersFaded )
      .then( () => {
        this.highlightInProgress = false;
        this.bus.emit('highlightend', node);
      })
    );
  }

  unhighlight(){
    if( !this.hasHighlight() ){ return Promise.resolve(); }

    const { cy } = this;
    const allEles = cy.elements();
    const allNodes = cy.nodes();

    cy.stop();
    allNodes.stop();

    const nhood = this.lastHighlighted;
    const others = this.lastUnhighlighted;

    this.lastHighlighted = this.lastUnhighlighted = null;

    const hideOthers = function(){
      others.addClass('hidden');

      return Promise.resolve();
    };

    const resetClasses = function(){
      cy.batch(function(){
        allEles.removeClass('hidden').removeClass('faded').removeClass('highlighted');
      });
      
      return Promise.resolve();
    };

    const animateToOrgPos = function( nhood ){
      return Promise.all( nhood.nodes().map(n => {
        return n.animation({
          position: getOrgPos(n),
          duration: animationDuration,
          easing: easing
        }).play().promise();
      }) );
    };

    const restorePositions = () => {
      cy.batch(() => {
        others.nodes().positions(getOrgPos);
      });

      return animateToOrgPos( nhood.nodes() );
    };

    this.bus.emit('unhighlight');

    return (
      Promise.resolve()
      .then( hideOthers )
      .then( restorePositions )
      .then( resetClasses )
    );
  }

  updateSearch(queryString){
    const normalize = str => str.toLowerCase();
    const getWords = str => str.split(/\s+/);
    const queryWords = getWords(normalize(queryString));

    const addWords = (wordList, wordsStr) => {
      if( wordsStr ){
        wordList.push(...getWords(normalize(wordsStr)));
      }
    };

    const cacheNodeWords = node => {
      const data = node.data();
      const wordList = [];
      
      addWords(wordList, data.name);
      addWords(wordList, data.Synonym);
      addWords(wordList, data.NodeTypeFormatted);
      addWords(wordList, data.Milk);
      addWords(wordList, data.Type);
      addWords(wordList, data.Country);
        
      node.data('words', wordList);
    };

    const getStringSimilarity = (queryWord, nodeWord) => {
      const index = nodeWord.indexOf(queryWord);

      if( index === 0 ){
        const diff = Math.abs(nodeWord.length - queryWord.length);
        const maxLength = Math.max(nodeWord.length, queryWord.length);
        
        return 1 - (diff / maxLength);
      } else {
        return 0;
      }
    };

    const getMetric = (node, queryWords) => {
      const nodeWords = node.data('words');
      let score = 0;

      for( let i = 0; i < nodeWords.length; i++ ){
        let nodeWord = nodeWords[i];

        for( let j = 0; j < queryWords.length; j++ ){
          let queryWord = queryWords[j];
          let similarity = getStringSimilarity(queryWord, nodeWord);

          if( similarity > minSimilarityValue ){
            score += similarity;
          }
          
        }
      }
      return score;
    };

    const getNodeMetric = memoize(node => getMetric(node, queryWords), node => node.id());

    if( !this.cachedNodeWords ){
      this.cy.batch(() => {
        this.nodes.forEach(cacheNodeWords);
      });

      this.cachedNodeWords = true;
    }

    this.searchMatchNodes = this.nodes.filter(node => {
      return getNodeMetric(node) > minMetricValue;
    }).sort((nodeA, nodeB) => {
      return getNodeMetric(nodeB) - getNodeMetric(nodeA);
    });

    this.bus.emit('updateSearch', this.searchMatchNodes);

    return this.searchMatchNodes;
  }

  getSearchMatchNodes(){
    return this.searchMatchNodes;
  }
}

export default Controller;
export { Controller };