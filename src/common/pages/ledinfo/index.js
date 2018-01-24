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
import './index.less'
import moment from 'moment'
import {
    languageKindList,
    publishCountry,
    serverurl
} from '../../utils/config'
import JsonUtils from '../../utils/JSONUtils'

require('es6-promise').polyfill();

const confirm = Modal.confirm

const directflags = [];
const busstationids = [];

export default class Ledinfo extends React.Component {
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

        cFetch(serverurl+`bs/list`,{
            method: 'POST',
            body:JsonUtils.mapToJson(paramsmap)
        }).then(data => {
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
                console.log(songList[i].stationid);
                songArray.push({
                    stationid: songList[i].stationid,
                    stopcode: songList[i].stopcode,
                    ordernumber: songList[i].ordernumber,
                    stopname: songList[i].stopname,
                    nameforshort: songList[i].nameforshort,
                    stoptype: songList[i].stoptype,
                    longitude: songList[i].longitude,
                    latitude: songList[i].latitude,
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
         }).catch(e => {
             console.log(e);
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
        cFetch(`http://192.168.44.238:8080/st/lists`, {
            method: 'POST'
        })
        .then(data => {
            let songList = data.list;
            for (let i = 0; i < songList.length; i++) {
                busstationids.push({value: songList[i].stationid,mean: songList[i].name,})
            }
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
            dataIndex: 'stationid',
            title: '站点编码',
            width: 200,
        },{
            dataIndex: 'stopcode',
            title: '站台编码',
            width: 200,
        }, {
            dataIndex: 'ordernumber',
            title: '行向',
            width: 200,
        }, {
            dataIndex: 'stopname',
            title: '站点名称',
            width: 200,
        }, {
            dataIndex: 'nameforshort',
            title: '站名简称',
            width: 200,
        },{
            dataIndex: 'stoptype',
            title: '站台位置',
            width: 200,
        },{
            dataIndex: 'longitude',
            title: '经度',
            width: 200,
        },{
            dataIndex: 'latitude',
            title: '纬度',
            width: 200,
        }, ]
    }

    add() {
        this.setState({
            modalShow: true
        })
    }

    onOk(param) {
        message.success('添加成功')
        this.onCancel()
    }

    onCancel() {
        this.setState({
            modalShow: false
        })
    }

    onOkEdit(param) {
        this.setState({
            modalShowEdit: false
        })
        message.success('编辑成功')
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
                    message.success('删除成功')
                },
                onCancel() {}
            })
        }
    }

    fields = () => {
        fetch(`http://192.168.44.238:8080/st/lists`, {
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
            label: '站点编码',
            type: 'input',
            name: 'busstationid',
            options: {
                rules: [{
                    required: true,
                    message: '站点编码必输!',
                }]
            }
        }, {
            label: '站台编码',
            type: 'input',
            name: 'stopcode',
            options: {
                rules: [{
                    required: true,
                    message: '站台编码必输!',
                }]
            }
        }, {
            label: '行向',
            type: 'select',
            name: 'ordernumber',
            items: () => directflags.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                rules: [{
                    required: true,
                    message: '行向必输!',
                }]
            }
        }, {
            label: '站点名称',
            type: 'select',
            name: 'name',
            items: () => directflags.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                rules: [{
                    required: true,
                    message: '站点名称必输!',
                }]
            }
        },{
            label: '站台简称',
            type: 'select',
            name: 'nameforshort',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                rules: [{
                    required: true,
                    message: '站台简称必输!',
                }]
            }
        },{
            label: '站台类型',
            type: 'select',
            name: 'stoptype',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                rules: [{
                    required: true,
                    message: '站台类型必输!',
                }]
            }
        },{
            label: '经度',
            type: 'select',
            name: 'longitude',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                rules: [{
                    required: true,
                    message: '经度必输!',
                }]
            }
        },{
            label: '纬度',
            type: 'select',
            name: 'latitude',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                rules: [{
                    required: true,
                    message: '纬度必输!',
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
            label: '站序',
            type: 'input',
            name: 'title',
            items: item.title,
            options: {
                initialValue: item.title,
                rules: [{
                    required: true,
                    message: '歌曲名必输!',
                }]
            }
        }, {
            label: '站点编码',
            type: 'input',
            name: 'author',
            options: {
                initialValue: item.author,
                rules: [{
                    required: true,
                    message: '歌手必输!',
                }]
            }
        }, {
            label: '行向',
            type: 'select',
            name: 'country',
            items: () => publishCountry.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                initialValue: item.country,
                rules: [{
                    required: true,
                    message: '发行国家必输!',
                }]
            }
        }, {
            label: '站点名称',
            type: 'select',
            name: 'language',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                initialValue: item.language,
                rules: [{
                    required: true,
                    message: '语种必输!',
                }]
            }
        },{
            label: '站点名称',
            type: 'select',
            name: 'language',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                initialValue: item.language,
                rules: [{
                    required: true,
                    message: '语种必输!',
                }]
            }
        },{
            label: '站点名称',
            type: 'select',
            name: 'language',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                initialValue: item.language,
                rules: [{
                    required: true,
                    message: '语种必输!',
                }]
            }
        },{
            label: '站点名称',
            type: 'select',
            name: 'language',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                initialValue: item.language,
                rules: [{
                    required: true,
                    message: '语种必输!',
                }]
            }
        },{
            label: '站点名称',
            type: 'select',
            name: 'language',
            items: () => languageKindList.map(ele => ({
                key: ele.value,
                value: ele.mean
            })),
            options: {
                initialValue: item.language,
                rules: [{
                    required: true,
                    message: '语种必输!',
                }]
            }
        }, {
            label: '发行时间',
            type: 'datetime',
            name: 'publishTime',
            options: {
                initialValue: moment(item.publishtime),
                rules: [{
                    required: true,
                    message: '发行时间必输!',
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