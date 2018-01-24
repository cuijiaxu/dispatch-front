import React from 'react'
import {
    Form,
    Input,
    Button,
    message,
    Modal
} from 'antd'
import SearchBar from 'components/searchbar'
import Table from 'components/table'

import 'whatwg-fetch'
import cFetch from '../../utils/cFetch'
import JsonUtils from '../../utils/JSONUtils'
//import fetchJsonp from 'fetch-jsonp'
import './index.less'
//import moment from 'moment'
import {
    serverurl
} from '../../utils/config'
import AddFieldSet from "../../components/addfieldset/index";
require('es6-promise').polyfill();
const addressArray = [];
const confirm = Modal.confirm
const adddatas = [];
const codeadd = [];
const FormItem = Form.Item;
const InputGroup = Input.Group;
export default class StationPlatform extends React.Component {
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
        paramsmap.set("code",typeId.code);
        paramsmap.set("name",typeId.name);
        console.log(paramsmap);
        cFetch(serverurl+`st/list`,{
                method: 'POST',
                body:JsonUtils.mapToJson(paramsmap)
            })
            .then(data => {
                const stationArray = [];
                let stationList = data.list;
                if (searchFields && searchFields.code) { // 机构搜索
                    // eslint-disable-next-line
                    stationList = stationList.filter(ele => ele.stationcode === codeadd.find(t => t.value === parseInt(searchFields.stationcode)).mean)
                }
                if (searchFields && searchFields.name) { // 线路搜索
                    // eslint-disable-next-line
                    stationList = stationList.filter(ele => ele.name === adddatas.find(t => t.value === parseInt(searchFields.name)).mean)
                }
                /*if (searchFields && searchFields.start) { // 发行时间段收索
                    songList = songList.filter(ele => moment(ele.publishtime) >= moment(searchFields.start) && moment(ele.publishtime) <= moment(searchFields.end))
                }*/
                for (let i = 0; i < stationList.length; i++) {
                    console.log(stationList[i].stationid);
                    stationArray.push({
                        stationid: stationList[i].stationid,
                        code: stationList[i].code,
                        name: stationList[i].name,
                        nameforshort: stationList[i].nameforshort,
                        parkingarea: stationList[i].parkingarea,
                        ordernum: stationList[i].ordernum,
                        type: stationList[i].type,
                        address: stationList[i].address,
                        longitude: stationList[i].longitude,
                        latitude: stationList[i].latitude,
                        createtime: stationList[i].createtime,
                    })
                }
                this.setState({
                    tData: stationArray
                });
                this.setState({
                    tabletotal: data.total,
                    tablepagesize: data.pageSize
                })
                this.setState({
                    loading: false
                });
            })
            .catch((e) => {
                console.log("fetcherror:"+e.message);
            });
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
        cFetch(serverurl+`st/lists`,{
            method: 'POST'
        })
            .then(data => {
                let songList = data.list;
                for (let i = 0; i < songList.length; i++) {
                    codeadd.push({value: songList[i].code,mean: songList[i].name,})
                    adddatas.push({value: songList[i].name,mean: songList[i].name,})
                }

            })
            .catch((e) => {
                console.log("fetcherror:"+e.message);
            });
        return [{
            title: '站点编码',
            key: 'code',
            type: 'select',
            defaultValue: '全部',
            onChange: (value) => this.fetchTableData(value),
            items: () => codeadd.map(ele => ({
                value: ele.value,
                mean: ele.mean
            })),
        }, {
            title: '站点名称',
            key: 'stopname',
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
            dataIndex: 'stationid',
            title: '站点ID',
            width: 200,
        },{
            dataIndex: 'code',
            title: '站点编码',
            width: 200,
        }, {
            dataIndex: 'name',
            title: '站点名称',
            width: 200,
        }, {
            dataIndex: 'nameforshort',
            title: '站点简称',
            width: 200,
        }, {
            dataIndex: 'parkingarea',
            title: '站台位置',
            width: 200,
        },{
            dataIndex: 'ordernum',
            title: '序号',
            width: 200,
            },{
            dataIndex: 'type',
            title: '类型',
            width: 200,
            },{
            dataIndex: 'address',
            title: '地址',
            width: 200,
        },{
            dataIndex: 'longitude',
            title: '经度',
            width: 100,
        }, {
            dataIndex: 'latitude',
            title: '纬度',
            width: 200,
        }, {
            dataIndex: 'createtime',
            title: '创建时间',
            width: 200,
            //renderer : moment.Format.dateRenderer('Y-m-d h:i:s'),
        } ]
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
        paramsmap.set("code",param.code);
        paramsmap.set("name",param.name);
        paramsmap.set("nameforshort",param.nameforshort);
        paramsmap.set("parkingarea",param.parkingarea);
        paramsmap.set("ordernum",param.ordernum);
        paramsmap.set("type",param.type);
        paramsmap.set("address",param.address);
        paramsmap.set("longitude",param.longitude);
        paramsmap.set("latitude",param.latitude);
        cFetch(serverurl+`st/add`,{
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
        paramsmap.set("code",param.code);
        cFetch(serverurl+`st/update`,{
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
            modalShowEdit: true
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
                    paramsmap.set("stationid",item.stationid);
                    cFetch(serverurl+`st/delete`,{
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
            label: '站点编码',
            type: 'input',
            name: 'code',
            options: {
                rules: [{
                    required: true,
                    message: '站点编码必输!',
                }]
            }
        }, {
            label: '站点名称',
            type: 'input',
            name: 'name',
            // items: () => adddatas.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '站点名称必输!',
                }]
            }
        }, {
            label: '站台名称',
            type: 'input',
            name: 'stopname',
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '站点名称必输!',
                }]
            }
        },{
            label: '站台简称',
            type: 'input',
            name: 'nameforshort',
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '站台位置必输!',
                }]
            }
        },{
            label: '站台位置',
            type: 'input',
            name: 'type',
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '站台位置必输!',
                }]
            }
        },{
            label: '排序',
            type: 'input',
            name: 'ordernum',
            options: {
                rules: [{
                    required: true,
                    message: '排序!',
                    }]
                }
            }, {
            label: '类型',
            type: 'input',
            name: 'type',
            options: {
                rules: [{
                    required: true,
                    message: '类型必输!',
                }]
            }
        },{
            label: '地址',
            type: 'input',
            name: 'address',
            options: {
                rules: [{
                    required: true,
                    message: '地址必输!',
                }]
            }
        },{
            label: '站台位置',
            type: 'addfieldset',
            name: 'longitude',
            options: {
                rules: [{
                    required: true,
                    message: '经度必输!',
                }]
            }
        // },{
        //     label: '纬度',
        //     type: 'input',
        //     name: 'latitude',
        //     options: {
        //         rules: [{
        //             required: true,
        //             message: '纬度必输!',
        //         }]
        //     }
        }]
    }

    fieldsEdit = () => {
        const item = this.state.item
        return [{
            label: '站点编码',
            type: 'input',
            name: 'code',
            items: item.code,
            options: {
                initialValue: item.code,
                rules: [{
                    required: true,
                    message: '站点编码必输!',
                }]
            }
        }, {
            label: '站点名称',
            type: 'input',
            name: 'name',
            items: item.name,
            options: {
                initialValue: item.name,
                rules: [{
                    required: true,
                    message: '站点名称必输!',
                }]
            }
        }, {
            label: '站台名称',
            type: 'input',
            name: 'stopname',
            items: item.stopname,
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.stopname,
                rules: [{
                    required: true,
                    message: '站点名称必输!',
                }]
            }
        },{
            label: '站台简称',
            type: 'input',
            name: 'nameforshort',
            items: item.nameforshort,
            // items: () => languageKindList.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                initialValue: item.nameforshort,
                rules: [{
                    required: true,
                    message: '站台简称必输!',
                }]
            }
        },{
            label: '站台位置',
            type: 'input',
            name: 'type',
            items: item.type,
            options: {
                initialValue: item.type,
                rules: [{
                    required: true,
                    message: '站台位置必输!',
                }]
            }
        },{
            label: '排序',
            type: 'input',
            name: 'ordernum',
            items: item.ordernum,
            options: {
                initialValue: item.ordernum,
                rules: [{
                    required: true,
                    message: '排序!',
                }]
            }
        }, {
            label: '类型',
            type: 'input',
            name: 'type',
            items: item.type,
            options: {
                initialValue: item.type,
                rules: [{
                    required: true,
                    message: '类型必输!',
                }]
            }
        },{
            label: '地址',
            type: 'input',
            name: 'address',
            items: item.address,
            options: {
                initialValue: item.address,
                rules: [{
                    required: true,
                    message: '地址必输!',
                }]
            }
        },{
            label: '经度',
            type: 'input',
            name: 'longitude',
            // items: () => addressArray.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '经度必输!',
                }]
            }
        },{
            label: '纬度',
            type: 'input',
            name: 'latitude',
            // items: () => addressArray.map(ele => ({
            //     key: ele.value,
            //     value: ele.mean
            // })),
            options: {
                rules: [{
                    required: true,
                    message: '纬度必输!',
                }]
            }
        }]
    }

    render() {
       // const { getFieldDecorator} = this.props.Form;
        //const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
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
                            //scroll={{y: 285 }}
                            //scroll={{ x: 2500, y: 200 }}
                            scroll={{ x: '80%', y: 380 }}
                        />
                    </div>
                </div>
                <Modal
                    modalKey="add"
                    visible={this.state.modalShow}
                    title="添加页面"
                    fields={this.fields()}
                    //footer={<AddFieldSet/>}
                    onOk={this.onOk}
                    onCancel={this.onCancel}
                    okText="保存"
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="站点编码"
                        >
                            {/*{getFieldDecorator('code', {*/}
                                {/*rules: [{ required: true, message: 'Please input your username!' }],*/}
                            {/*})*/}

                                <Input  type="code" style={{ width: '60%', marginRight: 8 }}/>

                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="站点名称"
                        >
                            {/*{getFieldDecorator('name', {*/}
                                {/*rules: [{ required: true, message: 'Please input your username!' }],*/}
                            {/*})*/}
                                <Input  style={{ width: '60%', marginRight: 8 }}/>
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="站台编码"
                        >
                            {/*{getFieldDecorator('address', {*/}
                                {/*rules: [{ required: true, message: 'Please input your username!' }],*/}
                            {/*})*/}
                                <Input style={{ width: '60%', marginRight: 8 }}/>
                        </FormItem>
                        <AddFieldSet/>
                    </Form>
                </Modal>
                <Modal
                    modalKey="Edit"
                    visible={this.state.modalShowEdit}
                    title="修改音乐"
                    fields={this.fieldsEdit()}
                    onOk={this.onOkEdit}
                    onCancel={this.onCancelEdit}
                    okText="保存"
                >
                <FormItem
                    {...formItemLayout}
                    label="站点编码"
                >
                    {/*{getFieldDecorator('code', {*/}
                    {/*rules: [{ required: true, message: 'Please input your username!' }],*/}
                    {/*})*/}
                        <Input  type="code" style={{ width: '60%', marginRight: 8 }}/>
                </FormItem>
                <InputGroup>
                    <Input style={{ width: 90, textAlign: 'center' }} placeholder="方向" />
                    <Input style={{ width: 0.8, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#AEEEEE' }} disabled />
                    <Input style={{ width: 90, textAlign: 'center', borderLeft: 0 }} placeholder="经度" />
                    <Input style={{ width: 0.8, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#AEEEEE' }} disabled />
                    <Input style={{ width: 90, textAlign: 'center', borderLeft: 0 }} placeholder="纬度" />
                </InputGroup>
                </Modal>
            </div>
        )
    }
}