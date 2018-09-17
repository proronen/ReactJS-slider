import React, { Component } from 'react';

export default class SlideImages extends Component {
    
    render () {
        const slide = this.props;
        
        return (
            <div className="image-slide" data-index={slide.index} style={{backgroundImage: `url(${slide.img})` }}></div>
        )
    }
}