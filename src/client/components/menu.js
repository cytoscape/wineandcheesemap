import { h, Component } from 'preact';
import classNames from 'classnames';
import debounce from 'lodash.debounce';
import { NodeInfo } from './node-info';

class Menu extends Component {
  constructor(props){
    super(props);

    const { controller } = props;
    const { bus } = controller;

    this.state = {
      open: controller.isMenuOpen()
    };

    bus.on('openMenu', this.onOpenMenu = (() => {
      this.setState({ open: true });

      this.focusTextBox();
    }));

    bus.on('closeMenu', this.onOpenMenu = (() => {
      this.setState({ open: false });
    }));

    bus.on('updateSearch', this.onUpdateSearch = (searchMatchNodes => {
      this.setState({ searchMatchNodes });
    }));

    this.debouncedUpdateSearch = debounce(() => this.updateSearch(), 250);
  }

  componentWillUnmount(){
    const { bus } = this.props.controller;

    bus.removeListener('openMenu', this.onOpenMenu);
    bus.removeListener('closeMenu', this.onCloseMenu);
    bus.removeListener('updateSearch', this.onUpdateSearch);
  }

  open(){
    const { controller } = this.props;

    controller.openMenu();
  }

  updateSearch(){
    const { controller } = this.props;
    const input = document.getElementById('menu-search');
    const results = document.getElementById('menu-search-results');
    const queryString = input.value;

    results.scrollTo(0, 0);

    controller.updateSearch(queryString);
  }

  focusTextBox(){
    const input = document.getElementById('menu-search');

    if( input ){
      input.focus();
    }
  }

  selectNode(node){
    const { controller } = this.props;

    controller.closeMenu();
    controller.highlight(node);
    controller.showInfo(node);
  }

  render(){
    const { controller } = this.props;
    const { open, searchMatchNodes } = this.state;
    const closed = !open;

    let searchResults = [];

    if( searchMatchNodes ){
      searchResults = searchMatchNodes.map(node => h('div.menu-node-info', {
        onClick: () => this.selectNode(node)
      }, [
        h(NodeInfo, { node })
      ]));
    }

    return h('div', { class: 'menu-parent' }, [
      h('div', {
        class: classNames({ 'menu-toggle': true, 'menu-open': open }),
        onClick: () => controller.toggleMenu()
      }),
      h('div', { class: classNames({ 'menu': true, 'menu-closed': closed }) }, [
        h('input', {
          type: 'text',
          class: 'menu-search',
          placeholder: 'Search',
          id: 'menu-search',
          onClick: () => this.open(),
          onKeyDown: () => this.debouncedUpdateSearch()
        }),
        h('div', { class: 'menu-search-results', id: 'menu-search-results' }, searchResults)
      ])
    ]);
  }
}

export default Menu;
export { Menu };