require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import ReactDOM from 'react-dom';

//获取json文件中图片的相关数据，并保存在imageData中
let imageData = require('../data/imageData.json');

//利用自执行函数，在imageData中添加图片的URL路径信息
imageData = (function getImageURL(imageDataArr) {
    for (var i = 0, j = imageDataArr.length; i < j; i++) {
        var singleImageData = imageDataArr[i];
        singleImageData.imageURL = require('../images/' + singleImageData.fileName);
        imageDataArr[i] = singleImageData;
    }
    return imageDataArr;
})(imageData);

//获取一定范围内的随机数
function getRangeRandom(low, high) {
    return Math.ceil(Math.random() * (high - low) + low);
}

//获取30度以内的随机角度
function get30degRandom() {
    return (Math.random() > 0.5 ? '' : '-' + Math.ceil(Math.random() * 30))
}

//卡片组件，包含图片和说明
class ImgFigure extends React.Component { //here

    /*点击事件的处理函数
     *当点击某一卡片或控制按钮时
     *如果对应卡片居中（arrange属性中的isCenter为true）,则翻转卡片，否则居中卡片
     */
    handleClick(e) {
        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }
        e.stopPropagation();//停止冒泡
        e.preventDefault();
    }

    //渲染
    render() {
        var styleObj = {}; //here

        //舞台为每个卡片组件都添加了data属性（保存图片信息）,arrange属性（保存卡片的位置、角度、居中和翻转的状态信息）

        //如果卡片arrange属性中的pos存在，即指定了卡片的位置，则在样式中使用
        if (this.props.arrange.pos) {
            styleObj = this.props.arrange.pos;
        }

        //如果卡片arrange属性中的rotate存在,即指定了卡片的角度，则在样式中使用（并添加浏览器厂商前缀）
        if (this.props.arrange.rotate) {
            ['MozTransform', 'msTransform', 'WebkitTransform', 'transform'].forEach(function(value) {
                styleObj[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            }.bind(this));
        }

        //如果卡片arrange属性中的isCenter为true,即指定了卡片在中心位置，则在样式中设置不能被其他卡片覆盖
        if (this.props.arrange.isCenter) {
            styleObj.zIndex = 11;
        } else {
            styleObj.zIndex = 0;
        }

        //如果卡片arrange属性中的isInverse属性为true,则卡片被翻转，为卡片最外层标签添加className，使其呈现翻转效果，否则不添加。
        var imgFigureClassName = 'img-figure';
        imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

        /*返回的html；
         *使用舞台提供的data属性获取某一卡片中图片的信息；
         *绑定点击事件处理函数
         */
        return ( <figure className = {
                imgFigureClassName
            }
            style = {
                styleObj
            }
            ref = "figure"
            onClick = {
                this.handleClick.bind(this)
            } >
            <img src = {
                this.props.data.imageURL
            }
            alt = {
                this.props.data.title
            }
            /> <figcaption> <h2 className = "img-title"> {
            this.props.data.title
        } </h2> <div className = "img-back"
        onClick = {
                this.handleClick.bind(this)
            }>
            <p> {
                this.props.data.desc
            } </p> </div > </figcaption> </figure>
        );
    }
}

//控制按钮组件
class ControllerUnit extends React.Component {
    handleClick(e) {
        //通过arrange属性判断，如果点击的按钮对应序号（index）是居中的卡片，则卡片翻转；否则居中
        if (this.props.arrange.isCenter) {
            this.props.inverse();
        } else {
            this.props.center();
        }

        e.stopPropagation();
        e.preventDefault();
    }
    //
    render() {
        var controllerUintClassName = 'controller-unit';

        // 如果对应的是居中的卡片，样式是放大
        if (this.props.arrange.isCenter) {
            controllerUintClassName += ' is-center';
        }

        // 如果对应的是翻转的卡片，样式是翻转
        if (this.props.arrange.isInverse) {
            controllerUintClassName += ' is-inverse';
        }

        return ( <span className = {
                controllerUintClassName
            }
            onClick = {
                this.handleClick.bind(this)
            } > </span>
        );
    }
}

//舞台组件，控制流程
class GalleryByReactApp extends React.Component {

    constructor(props) {
        super(props)
        this.state = {//state改变才会引发再一次渲染
            imgsArrangeArr: [], 
            isInverse: false
        };
        this.Constant = { //设置位置参数
            centerPos: {
                left: 0,
                top: 0
            },
            hPosRange: { //水平方向的取值范围
                leftSecX: [0, 0],
                rightSecX: [0, 0],
                y: [0, 0]
            },
            vPosRange: { //垂直方向的取值范围
                x: [0, 0],
                topY: [0, 0]
            }
        }
   }

    //组件加载后，为每张图片计算其位置
     componentDidMount() {

        //首先拿到舞台大小
        var stageDOM = this.refs.stage, //使用ref获得舞台最外层标签的真实DOM节点
            stageW = stageDOM.scrollWidth, //舞台宽
            stageH = stageDOM.scrollHeight, //舞台高
            halfStageW = Math.ceil(stageW / 2), //半舞台宽
            halfStageH = Math.ceil(stageH / 2); //半舞台高

        //拿到一个卡片的大小
        var imgFigureDOM = this.refs.imgFigure0.refs.figure, //获得第一个卡片组件顶层元素的真实DOM节点
            imgW = imgFigureDOM.scrollWidth, //卡片宽
            imgH = imgFigureDOM.scrollHeight, //卡片高
            halfImgW = Math.ceil(imgW / 2), //一半卡片宽
            halfImgH = Math.ceil(imgH / 2); //一半卡片高

        //为位置参数填充数据
        //计算中心图位置点
        this.Constant.centerPos = {
            left: halfStageW - halfImgW,
            top: halfStageH - halfImgH
        };
        //计算左右侧卡片位置取值范围
        this.Constant.hPosRange.leftSecX[0] = -halfImgW;
        this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
        this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
        this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
        this.Constant.hPosRange.y[0] = -halfImgH;
        this.Constant.hPosRange.y[1] = stageH - halfImgH;

        //计算上侧卡片位置取值范围
        this.Constant.vPosRange.topY[0] = -halfImgH;
        this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
        this.Constant.vPosRange.x[0] = halfStageW - imgW;
        this.Constant.vPosRange.x[1] = halfStageW;

        //计算完成后，开始布局,第一张卡片居中
        this.rearrange(0);
    }

    inverse(index) {
        return function() {
            var imgsArrangeArr = this.state.imgsArrangeArr;
            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

            this.setState({
                imgsArrangeArr: imgsArrangeArr//state改变，再一次渲染
            });
        }.bind(this);
    }

    center(index) {
            return function() {
                this.rearrange(index);
            }.bind(this);
        }

    //重新布局所有图片 centerIndex是中心卡片的序号
    rearrange(centerIndex) {
        var imgsArrangeArr = this.state.imgsArrangeArr,
            Constant = this.Constant,
            centerPos = Constant.centerPos,
            hPosRange = Constant.hPosRange,
            vPosRange = Constant.vPosRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.y,
            vPosRangeTopY = vPosRange.topY,
            vPosRangeX = vPosRange.x,

            imgsArrangeTopArr = [],
            topImgNum = Math.floor(Math.random() * 2),
            topImgSpliceIndex = 0,
            imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);

        //首先居中centerIndex的卡片,位于中心的图片无需旋转
        imgsArrangeCenterArr[0] = {
            pos: centerPos,
            rotate: 0,
            isCenter: true
        }


        //取出布局上侧的卡片的状态信息
        topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
        imgsArrangeTopArr = imgsArrangeArr.splice(
            topImgSpliceIndex, topImgNum
        );

        //布局位于上侧的卡片
        imgsArrangeTopArr.forEach(function(value, index) {
            imgsArrangeTopArr[index] = {
                pos: {
                    top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
                },
                rotate: get30degRandom(),
                isCenter: false
            }

        });

        //布局位于两侧的卡片
        for (var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++) {

            var hPosRangeLORX = null;
            //前半布局左，后半布局右
            if (i < k) {
                hPosRangeLORX = hPosRangeLeftSecX;
            } else {
                hPosRangeLORX = hPosRangeRightSecX;
            }
            imgsArrangeArr[i] = {
                pos: {
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
                },
                rotate: get30degRandom(),
                isCenter: false
            }
        }

        if (imgsArrangeTopArr && imgsArrangeTopArr[0]) {
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }
        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);
        this.setState({
            imgsArrangeArr: imgsArrangeArr
        });
    }

    render() {
        var controllerUnits = [],
            imgFigures = [];

        /*初次渲染，设置默认状态，将每个卡片组件都添加到imgFigures数组中
         *携带属性有：data(含有该组件的fileName,title,description属性)，ref(用于定位)，key(方便定位)，arrange(含有该组件的位置信息)
         *index确定序号
         */
        imageData.forEach(function(value, index) {
            if (!this.state.imgsArrangeArr[index]) {
                this.state.imgsArrangeArr[index] = {
                    pos: {
                        left: 0,
                        top: 0
                    },
                    rotate: 0,
                    isInverse: false,
                    isCenter: false
                }
            } //here key
            imgFigures.push( <ImgFigure data = {
                    value
                }
                ref = {
                    'imgFigure' + index
                }
                key = {
                    index
                }
                arrange = {
                    this.state.imgsArrangeArr[index]
                }
                inverse = {
                    this.inverse(index).bind(this)
                }
                center = {
                    this.center(index).bind(this)
                }
                />);
                controllerUnits.push( <ControllerUnit key = {
                        index
                    }
                    arrange = {
                        this.state.imgsArrangeArr[index]
                    }
                    inverse = {
                        this.inverse(index).bind(this)
                    }
                    center = {
                        this.center(index).bind(this)
                    }
                    />);
        }.bind(this));

        return ( <section className = "stage"
            ref = "stage"> <section className = "img-sec"> {
                imgFigures
            } </section>  <nav className="controller-nav">{
                controllerUnits
            } </nav> </section> 
        );
    }
}


GalleryByReactApp.defaultProps = {};
ReactDOM.render( <GalleryByReactApp / > ,
    document.getElementById('content')
)