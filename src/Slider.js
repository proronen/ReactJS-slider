import React, { Component } from 'react';
import SlideTitles from "./components/SlideTitles";
import SlideImages from "./components/SlideImages";
import './Slider.css';

class Slider extends Component {
    
    constructor(props) {
        super(props);
        
        this.TopCarouselCont = React.createRef();
        this.bottomCarousel = React.createRef();

        this.state = {
            data: [],
            slideWidth: 0,
            positionIndex: 0,
        }
    }

    componentDidMount(){
        fetch("http://localhost:3000/data.json")
        .then(res => res.json())
        .then(data => {
            this.setState({data})
            this.setState({ slideWidth: document.querySelector('.image-slide').offsetWidth });

            this.init();
        });
        
    }

    topSlides () {
        return this.state.data.map((slide, i) => {
            return (<SlideImages 
                img={slide.img}
                title={slide.title}
                index={i}
                key={i}
            />);
        });
    }
    
    bottomSlides = (func,cname) => {
        return this.state.data.map((slide, i) => {
            return (<SlideTitles 
                title = {slide.title}
                index = {i}
                func  =  {func || null} 
                cname = {cname || null} 
                key={i}
            />);
        });
    }
    
    navRight = (e) => {
        
        const positionIndex = this.state.positionIndex;

        if( positionIndex === this.state.data.length -1) {
            // end of the loop
        
            this.TopCarouselCont.current.style['transition'] = "none";
            this.TopCarouselCont.current.style['transform'] = 'translate3d(0px,0,0)';
            this.scroller("top",0);
            this.TopCarouselCont.current.style['transition'] = null;
            this.setState({positionIndex: 0})
            
            // same with the titles
            this.scroller("bottomRightLastIndex");
        
        } else {
        
            const posIndex = positionIndex + 1;
            this.setState({positionIndex: posIndex}) 
            
            this.scroller("top", posIndex);
            this.scroller("bottomGoRight");
        }
    }
    
    navLeft = (e) => {
        const positionIndex = this.state.positionIndex;
        const dataLength = this.state.data.length;
        
        if(positionIndex > 0) {
            const posIndex = positionIndex -1;
            this.scroller("top",posIndex);
            
            this.setState({positionIndex: posIndex})
            this.scroller("bottomGoLeft");
        } else {
            // This is the first slide and we want a smooth tranitioning to the last slide
            this.TopCarouselCont.current.style['transition'] = "none";
            this.bottomCarousel.current.style['transition'] = "none";
            
            let newPos = document.getElementById("firstSlide").offsetLeft;
            this.TopCarouselCont.current.style['transform'] = "translate3d(" + -(newPos) + "px,0,0)";
            
            const posIndex = dataLength-1;
            this.scroller("top",posIndex);
            this.TopCarouselCont.current.style['transition'] = null;
            
            // titles
            this.scroller("bottomLeftFirstIndex");

            this.setState({positionIndex: posIndex})
        }
    }
    
    init(){

        // This will prevent the easing on load
        
        this.TopCarouselCont.current.style['transition'] = "none";
        this.bottomCarousel.current.style['transition'] = "none";

        setTimeout(() => {
            // And this will reset the transition and let the easing work once again. 
            this.TopCarouselCont.current.style['transition'] = null;
            this.bottomCarousel.current.style['transition'] = null;
        }, 100);
        
        this.resizeSliderHeight();
        
        // this will make the longest box set the title boxes width
        let titles = document.querySelectorAll('.title-slide');
        
        let titlesBox = 0;
        
        titles.forEach( (data) => {
            if(data.offsetWidth > titlesBox){
                titlesBox =  data.offsetWidth
            }
        });
        
        titles.forEach( (data) => {
            data.style.width = titlesBox + "px";
        });
        
        // Now we will center the first title box to the center
        this.scroller("bottomInitial");
        // this will make the loop seems natural when we duplicate the first and last images
        this.cloneSlides();    
        this.handleBottomSlides();    
        
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("resize", this.updateSlider);
    }

    cloneSlides () {
        let firstSlide = document.querySelectorAll(".image-slide")[0];
        let lastSlide = document.querySelectorAll(".image-slide")[this.state.data.length-1];
        
        let clone = lastSlide.cloneNode(true);
        clone.id = "lastSlide";
        delete(clone.dataset.index);
        document.querySelector(".topCarousel .items").insertBefore(clone,firstSlide);
        
        clone = firstSlide.cloneNode(true);
        clone.id = "firstSlide";
        delete(clone.dataset.index);
        document.querySelector(".topCarousel .items").appendChild(clone);
    }
            
    handleBottomSlides () {
        document.querySelectorAll(".middle")[0].previousSibling.id = "lastBox";
        document.querySelectorAll(".middle")[this.state.data.length-1].nextSibling.id = "firstBox";
    }
            
    resizeSliderHeight () {
        
        const winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        
        var sliderHeight = 0.7;
        if(winWidth < 768 ) {
            sliderHeight = 0.3;
        }
        
        let imageSlides = document.querySelectorAll('.image-slide');
        imageSlides.forEach( (data) => {
            data.style.height = (height*sliderHeight)+"px";
        });
    }
            
    handleKeyUp = e => { 
        if(e.keyCode === 37 ) {
            this.navLeft();    
        } else if(e.keyCode === 39 ) {
            this.navRight();    
        }
    }

    updateSlider = () => {
        this.scroller("top",this.state.positionIndex);
        this.scroller("bottomJumpToIndex",this.state.positionIndex);    
        this.resizeSliderHeight();
    }

    titlesClick = (e) => {
        
        const slideIndex = e.target.getAttribute("data-index");
    
        this.scroller("top",slideIndex);
        this.scroller("bottomJumpToIndex",slideIndex);
        this.setState({positionIndex: Number(slideIndex)});
    }

    scroller = (dir,scrollToIndex) => {
        
        const winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const posIndex = this.state.positionIndex;
        const middle = document.querySelector(".middle");
        const middleAll = document.querySelectorAll(".middle");
        const boxWidth = middle.offsetWidth;
        const topCarouselCont = this.TopCarouselCont.current.style;
        const bottomCarousel = this.bottomCarousel.current.style;
        
        if(dir === "top") {
            
            const el = document.querySelector(".topCarousel [data-index='"+scrollToIndex+"']");
            
            if(el){
                const newPos = el.offsetLeft;
                topCarouselCont['transform'] = 'translate3d(' + -(newPos) + 'px,0,0)'; 
            }
            
        } else if (dir === "bottomInitial"){
            
            const newPos = middle.offsetLeft - ((winWidth/2) - (middle.offsetWidth)/2);
            bottomCarousel['transform'] = 'translate3d(' + -(newPos) + 'px,0,0)';
            
        } else if (dir === "bottomLeftFirstIndex"){
            
            let index = this.state.data.length -1;
            if(scrollToIndex)
            index = scrollToIndex;
            
            bottomCarousel['transition'] = "none";
            const box = document.querySelector("#firstBox").offsetLeft - (winWidth/2 - boxWidth/2);
            bottomCarousel['transform'] = 'translate3d(' + -(box) + 'px,0,0)';
            
            setTimeout(() => {
                
                bottomCarousel['transition'] = null;
                
                const newPos = middleAll[index].offsetLeft - (winWidth/2 - boxWidth/2);
                bottomCarousel['transform'] = 'translate3d(' + -(newPos) + 'px,0,0)';
                
            },50)
        
        }  else if(dir === "bottomGoLeft"){
            
            const newPos = middleAll[posIndex].offsetLeft - (winWidth/2 - boxWidth/2);
            bottomCarousel['transform'] = 'translate3d(' + -(newPos) + 'px,0,0)';
        
        } else if (dir === "bottomRightLastIndex"){
    
            bottomCarousel['transition'] = "none";
            const lbox = document.querySelector("#lastBox").offsetLeft - (winWidth/2 - boxWidth/2);
            bottomCarousel['transform'] = 'translate3d(' + -(lbox) + 'px,0,0)';
            
            setTimeout(() => {
                
                bottomCarousel['transition'] = null;
                let newPos = middle.offsetLeft - (winWidth/2 - boxWidth/2);
                
                
                if(scrollToIndex)
                newPos = middleAll[scrollToIndex].offsetLeft - (winWidth/2 - boxWidth/2);
                
                bottomCarousel['transform'] = 'translate3d(' + -(newPos) + 'px,0,0)';
                
            },50);
            
        } else if(dir === "bottomGoRight"){
            
            const newPos = middleAll[posIndex].offsetLeft - (winWidth/2 - boxWidth/2);
            bottomCarousel['transform'] = 'translate3d(' + -(newPos) + 'px,0,0)';
        
        } else if(dir === "bottomJumpToIndex") {
            
            if(Number(scrollToIndex) === Number(posIndex)) {
                return;
            } else if(scrollToIndex > posIndex ) {
                this.scroller("bottomRightLastIndex", scrollToIndex);    
            } else {
                this.scroller("bottomLeftFirstIndex", scrollToIndex);    
            }
            
            this.setState({positionIndex: scrollToIndex});
        }
    }
    
    render() {
        return (
            <div id="container">
                <button 
                    className="carousel-nav carousel-nav-left"
                    onClick={this.navLeft}
                >&#60;</button>

                <div className="wrap">
                     <div className='carousel topCarousel'>
                         <div className='items ' ref={ this.TopCarouselCont } style={{"transform": "translate3d(-"+this.state.slideWidth +"px, 0px, 0px)"}}>
                             {this.topSlides()}
                         </div>
                     </div>
                </div>
                
                 <div className="wrap bottom_slider">
                     <div className='carousel bottomCarousel'>
                        <div className='items' ref={ this.bottomCarousel}  style={{"transform": "translate3d(0, 0px, 0px)"}}>
                            {this.bottomSlides(this.titlesClick)}
                            {this.bottomSlides(this.titlesClick,"middle")}
                            {this.bottomSlides(this.titlesClick)}
                         </div>
                     </div>
                </div>

                <button 
                    className="carousel-nav carousel-nav-right"
                    onClick={this.navRight}
                >&#62;</button>
            </div>
        );
  }
}

export default Slider;