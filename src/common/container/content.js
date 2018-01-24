import React from 'react';
import { Route } from 'react-router-dom'
import { Layout } from 'antd'
import './content.less'
import index from 'pages/index'
import follow from 'pages/follow'
import Tools from 'pages/tools'
import BusStationManage from 'pages/busstationmanage'
import StationPlatform from 'pages/stationplatform'
import RouteManage from 'pages/routemanage'
import BusInfo from 'pages/businfo'
import FluxIn from 'pages/fluxIn'
import RouteStationConfig from 'pages/routestationconfig'
import Autofaregate from 'pages/autofaregate'
import Camerainfo from 'pages/camerainfo'
import Ledinfo from 'pages/ledinfo'
import Safegateinfo from 'pages/safegateinfo'
import Sysddl from 'pages/sysddl'

const { Content } = Layout

export default class Contents extends React.Component {
  render() {
    return (
      <Content className="content">
        <Route path="/index" component={index} />
        <Route path="/follow" component={follow} />
        <Route path="/tools" component={Tools} />
        <Route path="/busstationmanage" component={BusStationManage} />
        <Route path="/stationplatform" component={StationPlatform} />
        <Route path="/routemanage" component={RouteManage} />
        <Route path="/businfo" component={BusInfo} />
        <Route path="/fluxIn" component={FluxIn} />
        <Route path="/routestationconfig" component={RouteStationConfig} />
        <Route path="/autofaregate" component={Autofaregate}/>
        <Route path="/camerainfo" component={Camerainfo}/>
        <Route path="/ledinfo" component={Ledinfo}/>
        <Route path="/safegateinfo" component={Safegateinfo}/>
        <Route path="/sysddl" component={Sysddl}/>
      </Content>
    );
  }
}