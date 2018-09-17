import React, { Component } from 'react';

export default class SlideTitles extends Component {
    
    render () {
        const slide = this.props;
        
        if(slide.cname){
            return (
                <div className={`title-slide ${slide.cname}`} data-index={slide.index} onClick={slide.func}>{slide.title}</div>
            )
        } else {
            return (
                <div className={`title-slide`} data-index={slide.index} onClick={slide.func}>{slide.title}</div>
            )
        }
        
    }
}