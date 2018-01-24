import React from 'react'
import {
    Button,
    message,
    Modal
} from 'antd'
import SearchBar from 'components/searchbar'
import Table from 'components/table'
import {
    FormModal
} from 'components/modalForm'
import 'whatwg-fetch'
import cFetch from '../../utils/cFetch'
import JsonUtils from '../../utils/JSONUtils'
//import fetchJsonp from 'fetch-jsonp'
import './index.less'
import moment from 'moment'
import {
    serverurl
} from '../../utils/config'

require('es6-promise').polyfill();

const confirm = Modal.confirm
const adddatas = [];
export default class RouteManage extends React.Component {
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
        paramsmap.set("routeid",typeId.routeid);
        paramsmap.set("routecode",typeId.routecode);
        cFetch(serverurl+`rt/list`,{
                method: 'POST',
                body:JsonUtils.mapToJson(paramsmap)
            })
            .then(data => {
                const songArray = [];
                let songList = data.list;
                if (searchFields && searchFields.routeid) { // 机构搜索
                    // eslint-disable-next-line
                    songList = songList.filter(ele => ele.routeid === adddatas.find(t => t.value === parseInt(searchFields.routeid)).mean)
                }
                if (searchFields && searchFields.routecode) { // 线路搜索
                    // eslint-disable-next-line
                    songList = songList.filter(ele => ele.routecode === adddatas.find(t => t.value === parseInt(searchFields.routeid)).mean)
                }
                /*if (searchFields && searchFields.start) { // 发行时间段收索
                    songList = songList.filter(ele => moment(ele.publishtime) >= moment(searchFields.start) && moment(ele.publishtime) <= moment(searchFields.end))
                }*/

                for (let i = 0; i < songList.length; i++) {
                    console.log(songList[i].routeid);
                    songArray.push({
                        routeid: songList[i].routeid,
                        //stationid: songList[i].stationid,
                        routecode: songList[i].routecode,
                        companyid: songList[i].companyid,
                        routeflag: songList[i].routeflag,
                        deleted: songList[i].deleted,
                        useful: songList[i].useful,
                        busnummin: songList[i].busnummin,
                        busnumeffect: songList[i].busnumeffect,
                        tripnum: songList[i].tripnum,
                        createtime: songList[i].createtime,
                    })
                }
                this.setState({
                    tData: songArray
                });
                this.setState({
                    tabletotal: data.total,
                    tablepagesize: data.pageSize
                })
                this.setState({
                    loading: false
                });
            })
            // .catch((e) => {
            //     console.log("fetcherror:"+e.message);
            // });
    }

    componentDidMount() {
        this.fetchTableData('1') // 默认是热歌版
    }
    childPageChangeHandler  = (currentpage,pagesize) => {
        console.log("get current:"+ currentpage +",size:"+ pagesize);
        this.setState({
            tablecurrentpage: currentpage,
            tablepagesize: pagesize
        });
        this.fetchTableData(currentpage,pagesize)
    }
    onSearch = (searchFields) => {
        const typeId = searchFields.type ? searchFields.type : 1
        this.fetchTableData(typeId, searchFields)
    }

    searchFields = () => {
        cFetch(serverurl+`rt/list`,{
            method: 'POST'
        })
            .then(data => {
                let songList = data.list;
                for (let i = 0; i < songList.length; i++) {
                    adddatas.push({value: songList[i].code,mean: songList[i].name,})
                }

            })
            .catch((e) => {
                console.log("fetcherror:"+e.message);
            });
        return [{
            title: '选择线路ID',
            key: 'routeid',
            type: 'select',
            defaultValue: '全部',
            onChange: (value) => this.fetchTableData(value),
            items: () => adddatas.map(ele => ({
                value: ele.value,
                mean: ele.mean
            })),
        }, {
            title: '选择线路编码',
            key: 'routecode',
            type: 'select',
            defaultValue: '全部',
            items: () => [{
                value: 0,
                mean: '全部'
            }].concat(adddatas.map(ele => ({
                value: ele.value,
                mean: ele.mean
            }))),
        }]
    }

    tableHeader = () => {
        return [{
            dataIndex: 'routeid',
            title: '线路ID',
            width: 200,
            // render: (text, record) => {
            // }
        }, {
            dataIndex: 'routecode',
            title: '线路编码',
            width: 200,
        }, {
            dataIndex: 'companyid',
            title: '机构编码',
            width: 200,
        }, {
            dataIndex: 'routeflag',
            title: '行向',
            width: 200,
        },{
            dataIndex: 'tripnum',
            title: '班次',
            width: 200,
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
        paramsmap.set("routeid",param.routeid);
        paramsmap.set("routecode",param.routecode);
        paramsmap.set("companyid",param.companyid);
        paramsmap.set("routeflag",param.routeflag);
        paramsmap.set("tripnum",param.tripnum);
        cFetch(serverurl+`rt/add`,{
            method: 'POST',
            body:JsonUtils.mapToJson(paramsmap)
        })
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
        paramsmap.set("routeid",param.routeid);
        cFetch(serverurl+`rt/update`,{
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
                    paramsmap.set("routeid",item.routeid);
                    cFetch(serverurl+`rt/delete`,{
                        method: 'POST',
                        body:JsonUtils.mapToJson(paramsmap)
                    })
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
        return [{
            label: '线路ID',
            type: 'input',
            name: 'routeid',
            options: {
                rules: [{
                    required: true,
                    message: '线路ID必输!',
                }]
            }
        }, {
            label: '线路编码',
            type: 'input',
            name: 'routecode',
            options: {
                rules: [{
                    required: true,
                    message: '站点编码必输!',
                }]
            }
        },{
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
            label: '行向',
            type: 'input',
            name: 'routeflag',
            // items: () => publishCountry.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '行向必输!',
                }]
            }
        },{
            label: '班次',
            type: 'input',
            name: 'tripnum',
            options: {
                rules: [{
                    required: true,
                    message: '班次必输!',
                }]
            }
        }]
        //     {
        //     label: '发行时间',
        //     type: 'datetime',
        //     name: 'publishTime',
        //     options: {
        //         rules: [{
        //             required: true,
        //             message: '发行时间必输!',
        //         }]
        //     }
        // }]
    }

    fieldsEdit = () => {
        const item = this.state.item
        return [{
            label: '线路ID',
            type: 'input',
            name: 'routeid',
            items: item.routeid,
            options: {
                initialValue: item.routeid,
                rules: [{
                    required: true,
                    message: '线路ID必输!',
                }]
            }
        }, {
            label: '线路编码',
            type: 'input',
            name: 'routecode',
            items: item.routecode,
            options: {
                initialValue: item.routecode,
                rules: [{
                    required: true,
                    message: '线路编码必输!',
                }]
            }
        }, {
            label: '机构编码',
            type: 'input',
            name: 'companyid',
            items: item.companyid,
            // items: () => publishCountry.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.companyid,
                rules: [{
                    required: true,
                    message: '机构编码必输!',
                }]
            }
        }, {
            label: '行向',
            type: 'input',
            name: 'routeflag',
            items: item.routeflag,
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.routeflag,
                rules: [{
                    required: true,
                    message: '行向必输!',
                }]
            }
        },{
            label: '班次',
            type: 'input',
            name: 'tripnum',
            items: item.routeflag,
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.tripnum,
                rules: [{
                    required: true,
                    message: '班次必输!',
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
                    title="修改"
                    fields={this.fieldsEdit()}
                    onOk={this.onOkEdit}
                    onCancel={this.onCancelEdit}
                    okText="保存"
                />
            </div>
        )
    }
}