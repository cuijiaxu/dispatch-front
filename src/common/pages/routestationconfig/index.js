import React from 'react'
import './index.less'
import DynamicFieldSet from 'components/dynamicfieldset'

export default class RouteStationConfig extends React.Component {

    render(){
        return (

            <div className="search-box">
                <DynamicFieldSet/>
            </div>


        );
    }
}




