require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
import ReactDOM from 'react-dom';

//获取图片相关数据
let imageData=require('../data/imageData.json');

//利用自执行函数，将图片名信息转成图片URL路径信息
imageData=(function getImageURL(imageDataArr){
  for(var i = 0,j = imageDataArr.length;i<j;i++){
    var singleImageData=imageDataArr[i];
    singleImageData.imageURL=require('../images/'+singleImageData.fileName);
    imageDataArr[i]=singleImageData; 
  }
  return imageDataArr;
})(imageData);

var GalleryByReactApp=React.createClass({
  render:function(){
    return (
      <section className="stage">
        <section className="img-sec">
        </section>
        <nav className="controller-nav">
        </nav>
      </section>
    );
  }

});

ReactDOM.render(
  <GalleryByReactApp />,
  document.getElementById('content')
)