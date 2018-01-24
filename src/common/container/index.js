import React from 'react';
import fetchJsonp from 'fetch-jsonp'
import { Link } from 'react-router-dom'
import { Menu, Icon, Switch, Layout } from 'antd'
// import { allMenu } from 'utils/menu'
import Top from './header'
import Contents from './content'
import Footer from './bottom'
import './index.less'

const SubMenu = Menu.SubMenu;
const { Sider } = Layout;



export default class Container extends React.Component {
  state = {
    theme: 'dark',
    current: 'index',
    collapsed: false,
    mode: 'inline',  // 水平垂直展现
    allMenu: []
  }
  componentDidMount() {
    this.handleClick([], 'index')
  }
  changeTheme = (value) => {
    this.setState({
      theme: value ? 'dark' : 'light',
    });
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      mode: this.state.collapsed ? 'inline' : 'vertical',
    });
  }
  clear = () => {
    this.setState({
      current: 'index',
    });
  }
  handleClick = (e, special) => {
    this.setState({
      current: e.key || special,
    });
  }

  jgetsn = fetchJsonp('http://192.168.95.185:10010/brt-signal/main/menujsonp',{
      timeout: 10000,
      jsonpCallback: 'callbacklist',
      jsonpCallbackFunction: 'callback'}).then(response => response.json())
      .then((data) => {
          console.log("data", data)
          this.setState({ allMenu :  JSON.parse(data)})
          console.log(this.state.allMenu)})
      .catch(e => console.log("Oops, error", e))


  render() {
    return (
      <Layout className="containAll">
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
          className="left Menu"
        >
          { this.state.theme === 'light' ? <a href="https://github.com/MuYunyun/react-antd-demo" target='_blank'><Icon type="github" className="logo" /></a> :
          <a href="https://github.com/MuYunyun/react-antd-demo" target='_blank'><Icon type="github" className="logo white" /></a> }
          { this.state.theme === 'light' ? <span className="author">BRT</span> : <span className="author white">BRT</span> }
          <Menu
            theme={this.state.theme}
            onClick={this.handleClick}
            defaultOpenKeys={['']}
            selectedKeys={[this.state.current]}
            className="menu"
            mode={this.state.mode}
          >
            {
              this.state.allMenu.map((subMenu) => {
                if (subMenu.menus && subMenu.menus.length) {
                  return (
                    <SubMenu key={subMenu.id} title={<span><Icon type={subMenu.icon} /><span>{subMenu.text}</span></span>}>
                      {subMenu.menus.map(menu => (
                        <Menu.Item key={menu.id}><Link to={`/${menu.url}`}>{menu.text}</Link></Menu.Item>
                      ))}
                    </SubMenu>
                  )
                }
                return (
                  <Menu.Item key={subMenu.id}>
                    <Link to={`/${subMenu.url}`}>
                      <Icon type={subMenu.icon} /><span className="nav-text">{subMenu.text}</span>
                    </Link>
                  </Menu.Item>
                )
              })
            }
          </Menu>
          <div className="switch">
            <Switch
              checked={this.state.theme === 'dark'}
              onChange={this.changeTheme}
              checkedChildren="Dark"
              unCheckedChildren="Light"
            />
          </div>
        </Sider>
        <Layout>
          <Top toggle={this.toggle} collapsed={this.state.collapsed} clear={this.clear} />
          <Contents />
          <Footer />
        </Layout>
      </Layout>
    );
  }
}