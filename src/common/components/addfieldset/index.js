import { Form, Input, Icon,  AutoComplete, Select } from 'antd';

import React from 'react';
const FormItem = Form.Item;

const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;
const InputGroup = Input.Group;

const stationplat = [{
    value: 'aaa',
    label: 'sss',
    width: '60%',
}];

let uuid = 1;
@Form.create()

export default class AddFieldSet extends React.Component {

    constructor(props) {
        super(props);
    }

    remove = (k) => {
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        // We need at least one passenger
        if (keys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    }

    add = () => {
        uuid++;
        const { form } = this.props;
        // can use data-binding to get
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(uuid);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            keys: nextKeys,
        });
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    }


    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: { span: 24, offset: 1 },
                sm: { span: 20, offset: 4 },
            },
        };
        getFieldDecorator('keys', { initialValue: [1] });
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => {
            return (
                <FormItem
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? '站台位置' : ''}
                    required={false}
                    key={k}
                    formItemLayout
                >
                    {/*{getFieldDecorator('stationplat', {*/}
                        {/*initialValue: ['zhejiang', 'hangzhou', 'xihu'],*/}
                        {/*rules: [{ type: 'array',width:'60%', required: true, message: 'Please select your habitual residence!'}],*/}
                    {/*})(*/}
                        {/*<Cascader options={stationplat}/>*/}
                    {/*)}*/}
                    {getFieldDecorator(`names-${k}`,'stationplat',{
                        initialValue: ['zhejiang', 'hangzhou', 'xihu'],
                        rules: [{ type: 'array', required: true, message: 'Please select your habitual residence!' }],
                    })(
                        <InputGroup Input={stationplat}>
                            <Input style={{ width: 90, textAlign: 'center' }} placeholder="方向" />
                            <Input style={{ width: 0.8, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#AEEEEE' }} disabled />
                            <Input style={{ width: 90, textAlign: 'center', borderLeft: 0 }} placeholder="经度" />
                            <Input style={{ width: 0.8, borderLeft: 0, pointerEvents: 'none', backgroundColor: '#AEEEEE' }} disabled />
                            <Input style={{ width: 90, textAlign: 'center', borderLeft: 0 }} placeholder="纬度" />

                            <Icon
                            className="dynamic-add-button"
                            type="plus-circle-o"
                            //disabled={keys.length === 1}
                            onClick={() =>this.add(uuid)}
                             />
                            <Icon
                                className="dynamic-delete-button"
                                type="minus-circle-o"
                                disabled={keys.length === 1}
                                onClick={() => this.remove(k)}
                            />
                        </InputGroup>
                        //<SearchInput  style={{ width: '40%', marginRight: 8 }} />
                    )}
                    {keys.length > 0 ? (
                        <Icon
                            className="dynamic-add-button"
                            //type="plus-circle-o"
                            //disabled={keys.length === 1}
                            onClick={() =>this.add(uuid)}
                        />
                    ) : null}

                    {keys.length > 0 ? (
                        <Icon
                            className="dynamic-delete-button"
                            //type="minus-circle-o"
                            disabled={keys.length === 1}
                            onClick={() => this.remove(k)}
                        />
                    ) : null}
                </FormItem>
            );
        });
        return (
            <Form onSubmit={this.handleSubmit}>
                {formItems}
                <FormItem {...formItemLayoutWithOutLabel}>
                    <label type="dashed" onClick={this.add}  style={{ width: '60%'}}>
                        {/*<Icon type="plus" />tianjia*/}
                    </label>
                </FormItem>
                {/*<FormItem {...formItemLayoutWithOutLabel}>*/}
                    {/*<Button type="primary" htmlType="submit">Submit</Button>*/}
                {/*</FormItem>*/}
            </Form>
        );
    }
}


/*const WrappedDynamicFieldSet = Form.create()(DynamicFieldSet);
ReactDOM.render(<WrappedDynamicFieldSet />, mountNode);*/
