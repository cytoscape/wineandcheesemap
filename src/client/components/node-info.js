import { h, Component } from 'preact';

class NodeInfo extends Component {
  constructor(props){
    super(props);
  }

  render(){
    const { node } = this.props;
    const data = node.data();
    const { name } = data;
    const type = data.NodeTypeFormatted + (data.Type ? ` (${data.Type})` : '');
    const milk = data.Milk;
    const isMilk = milk != null;
    const country = data.Country;
    const hasCountry = country != null;
    const q = encodeURIComponent(data.NodeType === 'Cheese' ? `${name} cheese` : name);

    return h('div', { class: 'node-info' }, [
      h('div', { class: 'node-info-name' }, name),
      h('div', { class: 'node-info-type' }, type),
      isMilk ? h('div', { class: 'node-info-milk' }, milk) : null,
      hasCountry ? h('div', { class: 'node-info-country' }, country) : null,
      h('div', { class: 'node-info-more' }, [
        h('a', { target: '_blank', href: `https://google.com/search?q=${q}` }, 'More information')
      ])
    ]);
  }
}

export default NodeInfo;
export { NodeInfo };