import React from 'react'
import {
    Button,
    Modal,
    Card
} from 'antd'
import SearchBar from 'components/searchbar'
import Table from 'components/table'
import cFetch from '../../utils/cFetch'
import {
    FormModal
} from 'components/modalForm'
import 'whatwg-fetch'
import EchartsViews from './EchartsViews';
import JsonUtils from '../../utils/JSONUtils'
//import fetchJsonp from 'fetch-jsonp'
import { rangePicker } from 'antd';
import './index.less'
import {
    serverurl
} from '../../utils/config'
import moment from 'moment'
require('es6-promise').polyfill();

const confirm = Modal.confirm

export default class FluxIn extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tData: [],
            tabletotal: 0,
            tablepages: 1,
            tablepagesize: 10,
            tablecurrentpage: 1,
            tablecurrentpage: 1,
            item: {},
            DatePicker: {},
            loading: true,
            modalShow: false,
            modalShowEdit: false,
            rangevalue: null,
            begintime: null,
            endtime: null,
        }
        this.add = this.add.bind(this)
        this.onOk = this.onOk.bind(this)
        this.onCancel = this.onCancel.bind(this)
        this.onOkEdit = this.onOkEdit.bind(this)
        this.onCancelEdit = this.onCancelEdit.bind(this)
        //this.onChange = this.onChange.bind(this)
       // this.changerangestate = this.changerangestate.bind(this)
    }

    // 获取表格数据
    fetchTableData = (typeId, searchFields) => {
        var paramsmap = new Map();
        paramsmap.set("pageNum",this.state.tablecurrentpage);
        paramsmap.set("pageSize",this.state.tablepagesize);
        paramsmap.set("beginTime",this.state.begintime);
        paramsmap.set("endTime",this.state.endtime);
        console.log(paramsmap);
        cFetch(serverurl+`trade/Llist`,{
                method: 'POST',
                body:JsonUtils.mapToJson(paramsmap)
            })
            .then(data => {
                const songArray = [];
                let songList = data.list;
                if (searchFields && searchFields.begintime) { // 发行时间段收索
                    songList = songList.filter(ele => moment(ele.thtime) >= moment(searchFields.begintime) && moment(ele.thtime) <= moment(searchFields.begintime))
                }

                for (let i = 0; i < songList.length; i++) {
                    console.log(songList[i].tradedataid);
                    songArray.push({
                        tradedataid: songList[i].tradedataid,
                        organno: songList[i].organno,
                        organname: songList[i].organname,
                        lineno: songList[i].lineno,
                        cnt: songList[i].cnt,
                        stationcode: songList[i].stationcode,
                        thtime: songList[i].thtime,
                        staname: songList[i].staname,
                    })
                }
                this.setState({
                    tData: songArray
                });
                this.setState({
                    tabletotal: data.total,
                    tablepagesize: data.pageSize
                });
                this.setState({
                    loading: false
                });
            })
            .catch((e) => {
                console.log("fetcherror:"+e.message);
            });
    }
    childPageChangeHandler  = (currentpage,pagesize) => {
        console.log("get current:"+ currentpage +",size:"+ pagesize);
        this.setState({
            tablecurrentpage: currentpage,
            tablepagesize: pagesize
        });
        this.fetchTableData(currentpage,pagesize)
    }
    componentDidMount() {
        this.fetchTableData('1') // 默认是热歌版
    }

    onSearch = (searchFields) => {
        const typeId = searchFields.type ? searchFields.type : 1
        this.fetchTableData(searchFields)
    }

    searchFields = (value) => {
        return [{
            title: '发行时间段',
            key: ['begintime', 'endtime'],
            type: 'rangePicker',
            name: 'thtime',
            width: 200,
            onChange: (value,dateStrings) => this.changerangestate(value,dateStrings)
        }]
    }

    onChange = (value) => {
        console.log(value);
        this.setState({
            begintime: value[0],
            endtime: value[1]
        })
    }

    tableHeader = () => {
        return [{
            dataIndex: 'tradedataid',
            title: '客流量',
            width: 150,
        },{
            dataIndex: 'organno',
            title: '机构编码',
            width: 150,
        }, {
            dataIndex: 'organname',
            title: '机构名称',
            width: 150,
        }, {
            dataIndex: 'lineno',
            title: '线路编码',
            width: 150,
        }, {
            dataIndex: 'cnt',
            title: '客流量',
            width: 150,
        },{
            dataIndex: 'stationcode',
            title: '站点编码',
            width: 150,
        },{
            dataIndex: 'thtime',
            title: '创建时间',
            width: 150,
        },{
            dataIndex: 'staname',
            title: '创建时间',
            width: 150,
        },]
    }

    add() {
        this.setState({
            modalShow: true
        })
    }

    onOk(param) {

    }

    onCancel() {
        this.setState({
            modalShow: false
        })
    }

    onOkEdit(param) {

    }

    onCancelEdit() {
        this.setState({
            modalShowEdit: false
        })
    }



    render() {
        return (
            <div id="wrap">
                <SearchBar
                    onSubmit={this.onSearch}
                    fields={this.searchFields()}
                />
                <div className="cloud-box">
                    <Card>
                        <div className="pb-m">
                            <h3>访问量统计</h3>
                            <small>最近7天用户访问量</small>
                        </div>
                        <EchartsViews />
                    </Card>
                </div>
                <div className="tableBox">
                    <Button onClick={this.add} className="addButton">添加</Button>
                    <div style={{ paddingTop: 43 }}>
                        <Table
                            pagination={ true }
                            pageSize={this.state.tablepagesize}
                            currentPage={this.state.tablecurrentpage}
                            defaultCurrent={1}
                            total={this.state.tabletotal}
                            header={ this.tableHeader() }
                            data={ this.state.tData }
                            loading={ this.state.loading }
                            onPageChangeHandler={this.childPageChangeHandler}
                            scroll={{y: 385 }}
                        />
                    </div>
                </div>
            </div>
        )
    }
}