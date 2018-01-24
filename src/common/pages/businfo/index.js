import React from 'react'
import {
    Button,
    message,
    Modal
} from 'antd'
import SearchBar from 'components/searchbar'
import Table from 'components/table'
import cFetch from '../../utils/cFetch'
import {
    FormModal
} from 'components/modalForm'
import 'whatwg-fetch'
import JsonUtils from '../../utils/JSONUtils'
//import fetchJsonp from 'fetch-jsonp'
import './index.less'
import moment from 'moment'
import {
    serverurl
} from '../../utils/config'

require('es6-promise').polyfill();

const confirm = Modal.confirm

const directflags = [];
const busstationids = [];

export default class BusInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tData: [],
            tabletotal: 0,
            tablepages: 1,
            tablepagesize: 10,
            tablecurrentpage: 1,
            item: {},
            loading: true,
            modalShow: false,
            modalShowEdit: false,

        }
        this.add = this.add.bind(this)
        this.onOk = this.onOk.bind(this)
        this.onCancel = this.onCancel.bind(this)
        this.onOkEdit = this.onOkEdit.bind(this)
        this.onCancelEdit = this.onCancelEdit.bind(this)
    }

    // 获取表格数据
    fetchTableData = (typeId, searchFields) => {
        var paramsmap = new Map();
        paramsmap.set("pageNum",this.state.tablecurrentpage);
        paramsmap.set("pageSize",this.state.tablepagesize);
        console.log(paramsmap);
        cFetch(serverurl+`bus/lists`,{
                method: 'POST',
                body:JsonUtils.mapToJson(paramsmap)
            })
            .then(data => {
                const songArray = [];
                let songList = data.list;
                if (searchFields && searchFields.stationid) { // 站点编码
                    // eslint-disable-next-line
                    songList = songList.filter(ele => ele.stationid === busstationids.find(t => t.value === parseInt(searchFields.stationid)).mean)
                }
                if (searchFields && searchFields.stopname) { // 线路搜索
                    // eslint-disable-next-line
                    songList = songList.filter(ele => ele.stopname === busstationids.find(t => t.value === parseInt(searchFields.stopname)).mean)
                }
                /*if (searchFields && searchFields.start) { // 发行时间段收索
                    songList = songList.filter(ele => moment(ele.publishtime) >= moment(searchFields.start) && moment(ele.publishtime) <= moment(searchFields.end))
                }*/

                for (let i = 0; i < songList.length; i++) {
                    console.log(songList[i].businfoid);
                    songArray.push({
                        businfoid: songList[i].businfoid,
                        companyid: songList[i].companyid,
                        busname: songList[i].busname,
                        buscode: songList[i].buscode,
                        parkingarea: songList[i].parkingarea,
                        routecode: songList[i].routecode,
                        createtime: songList[i].createtime,
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
        this.fetchTableData(typeId, searchFields)
    }

    searchFields = () => {
        cFetch(serverurl+`bus/lists`,{
            method: 'POST'
        })
            .then(data => {
                let songList = data.list;
                for (let i = 0; i < songList.length; i++) {
                    busstationids.push({value: songList[i].businfoid,mean: songList[i].name,})
                }

            })
            .catch((e) => {
                console.log("fetcherror:"+e.message);
            });
        return [{
            title: '站点编码',
            key: 'stationid',
            type: 'select',
            defaultValue: '全部',
            onChange: (value) => this.fetchTableData(value),
            items: () => busstationids.map(ele => ({
                value: ele.value,
                mean: ele.mean
            })),
        }, {
            title: '站点名称',
            key: 'name',
            type: 'select',
            defaultValue: '全部',
            items: () => [{
                value: 0,
                mean: '全部'
            }].concat(busstationids.map(ele => ({
                value: ele.value,
                mean: ele.mean
            }))),
        }]
    }

    tableHeader = () => {
        return [{
            dataIndex: 'businfoid',
            title: '车辆ID',
            width: 150,
        },{
            dataIndex: 'companyid',
            title: '机构编码',
            width: 150,
        }, {
            dataIndex: 'busname',
            title: '车辆名称',
            width: 150,
        }, {
            dataIndex: 'buscode',
            title: '车辆编码',
            width: 150,
        }, {
            dataIndex: 'parkingarea',
            title: '停车区',
            width: 150,
        },{
            dataIndex: 'routecode',
            title: '线路编码',
            width: 150,
        },{
            dataIndex: 'createtime',
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
        var paramsmap = new Map();
        paramsmap.set("pageNum",this.state.tablecurrentpage);
        paramsmap.set("pageSize",this.state.tablepagesize);
        paramsmap.set("businfoid",param.businfoid);
        paramsmap.set("companyid",param.companyid);
        paramsmap.set("busname",param.busname);
        paramsmap.set("buscode",param.buscode);
        paramsmap.set("parkingarea",param.parkingarea);
        paramsmap.set("routecode",param.routecode);
        cFetch(serverurl+`bus/add`,{
            method: 'POST',
            body:JsonUtils.mapToJson(paramsmap)
        })
            .then(response => {
                return response.json()})
            .then(data => {
                if("success"===data){
                    message.success('添加成功');
                    this.searchFields()
                    //location.reload([])
                }else{
                    message.error('添加失败')
                }
            })
        this.onCancel()
    }

    onCancel() {
        this.setState({
            modalShow: false
        })
    }

    onOkEdit(param) {
        var paramsmap = new Map();
        paramsmap.set("businfoid",param.businfoid);
        cFetch(serverurl+`bus/update`,{
            method: 'POST',
            body:JsonUtils.mapToJson(paramsmap)
        })
            .then(data => {
                if ("success" === data) {
                    message.success('编辑成功')
                } else {
                    message.error('编辑失败')
                }
            })
        this.setState({
            modalShowEdit: false
        })
    }

    onCancelEdit() {
        this.setState({
            modalShowEdit: false
        })
    }

    tableAction = (actionKey, item) => {
        if (actionKey === 'edit') {
            this.setState({
                item: item,
                modalShowEdit: true
            })
        } else if (actionKey === 'delete') {
            confirm({
                title: '提示',
                content: '确定删除吗',
                onOk: () => {
            var paramsmap = new Map();
            paramsmap.set("businfoid",item.businfoid);
            cFetch(serverurl+`bus/delete`,{
                method: 'POST',
                body:JsonUtils.mapToJson(paramsmap)
            })
                .then(response => {
                    return response.json()})
                .then(data => {
                    if ("success" === data) {
                        message.success('删除成功')
                    } else {
                        message.error('删除失败')
                    }
                })
        },
                onCancel() {}
            })
        }
    }

    fields = () => {
        cFetch(serverurl+`bus/lists`,{
            method: 'POST'
        })
        .then(data => {
            let songList = data.list;
            for (let i = 0; i < songList.length; i++) {
               // busstationids.push({value: songList[i].stationid,mean: songList[i].name,})
                directflags.push({value: songList[i].name,mean: songList[i].name,})
            }
        })
        .catch((e) => {
            console.log("fetcherror:"+e.message);
        });

        return [{
            label: '车辆ID',
            type: 'input',
            name: 'businfoid',
            options: {
                rules: [{
                    required: true,
                    message: '车辆ID必输!',
                }]
            }
        }, {
            label: '机构编码',
            type: 'input',
            name: 'companyid',
            options: {
                rules: [{
                    required: true,
                    message: '机构编码必输!',
                }]
            }
        }, {
            label: '车辆名称',
            type: 'input',
            name: 'busname',
            // items: () => directflags.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '车辆名称必输!',
                }]
            }
        }, {
            label: '车辆编码',
            type: 'input',
            name: 'buscode',
            items: () => directflags.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                rules: [{
                    required: true,
                    message: '车辆编码称必输!',
                }]
            }
        },{
            label: '停车区',
            type: 'input',
            name: 'parkingarea',
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '停车区必输!',
                }]
            }
        },{
            label: '线路编码',
            type: 'input',
            name: 'routecode',
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '线路编码必输!',
                }]
            }
        }]
    }

    fieldsEdit = () => {
        const item = this.state.item
        return [{
            label: '车辆ID',
            type: 'input',
            name: 'businfoid',
            items: item.businfoid,
            options: {
                initialValue: item.businfoid,
                rules: [{
                    required: true,
                    message: '车辆ID必输!',
                }]
            }
        }, {
            label: '机构编码',
            type: 'input',
            name: 'companyid',
            items: item.companyid,
            options: {
                initialValue: item.companyid,
                rules: [{
                    required: true,
                    message: '机构编码必输!',
                }]
            }
        }, {
            label: '车辆名称',
            type: 'input',
            name: 'busname',
            items: item.busname,
            // items: () => publishCountry.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.busname,
                rules: [{
                    required: true,
                    message: '车辆名称必输!',
                }]
            }
        }, {
            label: '车辆编码',
            type: 'input',
            name: 'buscode',
            items: item.buscode,
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.buscode,
                rules: [{
                    required: true,
                    message: '车辆编码必输!',
                }]
            }
        },{
            label: '停车区',
            type: 'input',
            name: 'parkingarea',
            items: item.parkingarea,
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.parkingarea,
                rules: [{
                    required: true,
                    message: '语种必输!',
                }]
            }
        },{
            label: '线路编码',
            type: 'input',
            name: 'routecode',
            items: item.routecode,
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.routecode,
                rules: [{
                    required: true,
                    message: '线路编码必输!',
                }]
            }
        }]
    }

    render() {
        return (
            <div id="wrap">
                <SearchBar
                    onSubmit={this.onSearch}
                    fields={this.searchFields()}
                />
                <div className="tableBox">
                    <Button onClick={this.add} className="addButton">添加</Button>
                    <div style={{ paddingTop: 43 }}>
                        <Table
                            onCtrlClick={ this.tableAction }
                            pagination={ true }
                            pageSize={this.state.tablepagesize}
                            currentPage={this.state.tablecurrentpage}
                            defaultCurrent={1}
                            total={this.state.tabletotal}
                            header={ this.tableHeader() }
                            data={ this.state.tData }
                            loading={ this.state.loading }
                            onPageChangeHandler={this.childPageChangeHandler}
                            action={row => [{
                                key: 'edit',
                                name: '修改',
                                color: 'blue',
                                icon: 'edit',
                            }, {
                                key: 'delete',
                                name: '删除',
                                color: 'red',
                                icon: 'delete'
                            }]}
                            scroll={{y: 385 }}
                        />
                    </div>
                </div>
                <FormModal
                    modalKey="add"
                    visible={this.state.modalShow}
                    title="添加"
                    fields={this.fields()}
                    onOk={this.onOk}
                    onCancel={this.onCancel}
                    okText="保存"
                />
                <FormModal
                    modalKey="Edit"
                    visible={this.state.modalShowEdit}
                    title="修改音乐"
                    fields={this.fieldsEdit()}
                    onOk={this.onOkEdit}
                    onCancel={this.onCancelEdit}
                    okText="保存"
                />
            </div>
        )
    }
}