import { h, Component } from 'preact';

class CytoscapeComponent extends Component {
  constructor(props){
    super(props);
  }

  render(){
    return h('div', { id: 'cy' });    
  }

  componentDidMount(){
    const { cy, controller } = this.props;
    const container = document.getElementById('cy');

    cy.mount(container);
    cy.fit(10);

    cy.on('tap', this.onTap = e => {
      if( e.target === cy ){
        controller.unhighlight();
        controller.hideInfo();
        controller.closeMenu();
      } else {
        controller.highlight(e.target);
        controller.showInfo(e.target);
        controller.closeMenu();
      }
    });
  }

  componentWillUnmount(){
    const { cy } = this.props;

    cy.removeListener('tap', this.onTap);
  }
}

export default CytoscapeComponent;
export { CytoscapeComponent };