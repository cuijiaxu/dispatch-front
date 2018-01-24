import React from 'react';
import ReactEcharts from 'echarts-for-react';


// for(let i=0; i<=7; i++){
//     dateArray.push(moment(new Date() - (7 - i) * 24 * 3600 * 1000).format('YYYY-MM-DD'))
// }

const option = {
    color: ['#3398DB'],
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : [],
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'客流量',
            type:'bar',
            barWidth: '60%',
            data:[]
        }
    ]
};
// cFetch(serverurl+`st/list`,{
//     method: 'POST',
// })
//     .then(data => {
//         let songList = data.list;
//         for (let i = 0; i < songList.length; i++) {
//             codeadd.push({value: songList[i].code,code: songList[i].name,})
//             adddatas.push({value: songList[i].name,mean: songList[i].name,})
//         }
//     })

const EchartsViews = () => (
    <ReactEcharts
        option={option}
        style={{height: '280px', width: '100%'}}
        className={'react_for_echarts'}
    />
);

export default EchartsViews;