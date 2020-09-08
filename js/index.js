(function(w,d){
    var page = {
        init:function(){
            this.cartCount = d.querySelector('.cart-count')
            this.cartBox = d.querySelector('.cart-box')
            this.cartContent = d.querySelector('.cart-content')
            this.searchBtn = d.querySelector('.btn-search')
            this.searchInput= d.querySelector('.search-input')
            this.searchLayer = d.querySelector('.search-layer')
            this.categories = d.querySelector('.categories')

            this.parentCategories = d.querySelector('.parent-categories')
            this.childCategories = d.querySelector('.child-categories')
            this.hotProductList = d.querySelector('.hot .product-list')
            this.floorContainer = d.querySelector('.floor .container')
            this.elevator = d.querySelector('#elevator')
            
            this.searchTimer = null
            this.lastActiveIndex = 0
            this.parentCategoriesItem = null
            this.categoriesTimer = null

            this.elevatorTimer = null
            this.elevatorItems = null
            this.floors = null
            
            this.isSearchLayerEmpty = true
            
            this.handleCart()
            this.handleSerach()
            this.handleCategories()
            this.handleCarousel()
            this.handlehotProductList()
            this.handleFloor()
            this.handleElevator()
        },
        loadCartCount:function(){
            var _this = this
            utils.ajax({
                url:'/carts/count',
                success:function(data){
                    _this.cartCount.innerHTML = data.data
                },
             
            })
        },
        handleCart:function(){
            var _this = this
            this.loadCartCount()
            this.cartBox.addEventListener('mouseenter',function(){
                utils.show(_this.cartContent)
                _this.cartContent.innerHTML = '<div class="loader"></div>'
                utils.ajax({
                    url:'/carts',
                    success:function(data){
                        if(data.code == 0){
                            _this.renderCart(data.data.cartList)
                        }else{
                            _this.cartContent.innerHTML = '<span class="empty-cart">获取购物车失败,请稍后再试!</span>'                            
                        }
                    },
                    error:function(status){
                        _this.cartContent.innerHTML = '<span class="empty-cart">获取购物车失败,请稍后再试!</span>'
                    }
                })
            },false)
            //隐藏下拉购物车
            this.cartBox.addEventListener('mouseleave',function(){
                utils.hide(_this.cartContent)
            },false)
        },
        renderCart:function(list){
            var len = list.length
            if(len>0){
                var html = ''
                html += '<span class="cart-tip">最近加入的宝贝</span>'
                html += '<ul>'
                for(var i = 0;i<len;i++){
                    html += '<li class="cart-item clearfix">'
                    html += '   <a href="#" target="_blank">'
                    html += '       <img src="'+list[i].product.mainImage+' " alt=" ">'
                    html += '       <span class="text-ellipsis">'+list[i].product.name+'</span>'
                    html += '   </a>'
                    html += '   <span class="product-count">x '+list[i].count+' </span><span class="product-price">'+list[i].product.price+'</span>'
                    html += '</li>'
                }
                html += '</ul>'
                html += '<span class="line"></span>'
                html += '<a href="/cart.html" class="btn cart-btn">查看我的购物车</a>'
                this.cartContent.innerHTML = html
            }else{
                this.cartContent.innerHTML = '<span class="empty-cart">购物车中还没有商品,赶紧来购买吧!</span>'
            }
        },
        handleSerach:function(){
            var _this = this

            this.searchBtn.addEventListener('click',function(){
                _this.submitSearch()
            },false)
            //自动提示
            this.searchInput.addEventListener('input',function(){
                if(_this.searchTimer){
                    clearTimeout(_this.searchTimer)
                }
                _this.searchTimer = setTimeout(function(){
                    _this.getSearchData()
                },300)
            },false)
            //点击页面其他地方隐藏搜索提示层
            d.addEventListener('click',function(){
                utils.hide(_this.searchLayer)
            },false)
            //获取焦点显示搜索提示层
            this.searchInput.addEventListener('focus', function () {
                if (!_this.isSearchLayerEmpty){
                    utils.show(_this.searchLayer)
                }
            },false)
            //阻止输入框冒泡到document上
            this.searchInput.addEventListener('click',function(ev){
                ev.stopPropagation()
            },false)
            //事件委托处理层的提交
            this.searchLayer.addEventListener('click',function(ev){
                var elem = ev.target
                if(elem.className =elem.innerText){
                    var keyword = elem.innerText
                    _this.searchInput.value = keyword
                    _this.submitSearch()
                }
            },false)
        },
        submitSearch:function(){
            var keyword = this.searchInput.value
            w.location.herf = './list.html?keyword='+keyword
        },
        getSearchData:function(){
            var _this = this
            var keyword = this.searchInput.value 
            if(!keyword){
                this.appendSearchLayerHtml('')
                return
            }
            utils.ajax({
                url:'/products/search',
                data:{
                    keyword:keyword
                },
                success:function(data){
                    if(data.code == 0){
                        _this.renderSearchLayer(data.data)
                    }else{
                        _this.appendSearchLayerHtml('')
                    }
                },
                error:function(status){
                    _this.appendSearchLayerHtml('')
                }
            })
        },
        renderSearchLayer:function(list){
            var len = list.length
            var html = ''
            if(len>0){
                for(var i = 0;i<len;i++){
                    html += '<li class="search-item">'+list[i].name+'</li>'
                }
            }
            this.appendSearchLayerHtml(html)
        },
        appendSearchLayerHtml:function(html){
            if(html){
                utils.show(this.searchLayer)
                this.searchLayer.innerHTML = html
                this.isSearchLayerEmpty = false
            }else{
                utils.hide(this.searchLayer)
                this.searchLayer.innerHTML = html
                this.isSearchLayerEmpty = true
            }
        },
        handleCategories:function(){
            var _this = this
            this.getParentCategoriesData()

            //利用事件代理触发
            this.categories.addEventListener('mouseover',function(ev){
                    if(_this.categoriesTimer){
                        clearTimeout(_this.categoriesTimer)
                    }
                    _this.categoriesTimer = setTimeout(function(){
                        var elem = ev.target
                        if(elem.className == 'parent-categories-item'){
                            utils.show(_this.childCategories)
                            var pid = elem.getAttribute('data-id')
                            var index = elem.getAttribute('data-index')
                            
                            _this.parentCategoriesItem[_this.lastActiveIndex].className = 'parent-categories-item'
                            _this.parentCategoriesItem[index].className = 'parent-categories-item active'
                            _this.lastActiveIndex = index
                            _this.getChildCategoriesData(pid)
                        }
                     
                    },100)
              
            },false)
            this.categories.addEventListener('mouseleave',function(){
                if(_this.categoriesTimer){
                    clearTimeout(_this.categoriesTimer)
                }
                utils.hide(_this.childCategories)
                _this.childCategories.innerHTML = ''
                _this.parentCategoriesItem[_this.lastActiveIndex].className = 'parent-categories-item'
            })
        },
        getParentCategoriesData:function(){
            
            var _this = this
            utils.ajax({
                url:'/categories/arrayCategories',
                success:function(data){
                    if(data.code == 0){
                        _this.renderParentCategories(data.data)
                    }
                }
            })  
        },
        getChildCategoriesData:function(pid){
            var _this = this
            this.childCategories.innerHTML = '<div class="loader"></div>'
            utils.ajax({
                url:'/categories/childArrayCategories',
                data:{
                    pid:pid
                },
                success:function(data){
                    if(data.code == 0){
                        _this.renderChildCategories(data.data)
                    }
                }
            })
        },
        renderParentCategories:function(list){
            var len = list.length
            
            if(len>0){
                var html = '<ul>'
                for(var i=0;i<len;i++){
                    html += '<li class="parent-categories-item"  data-id="'+list[i]._id+'" data-index="'+i+'">'+list[i].name+'</li>'
                }
                html += '</ul>'
                this.parentCategories.innerHTML = html
            }
           this.parentCategoriesItem = d.querySelectorAll('.parent-categories-item') 
        },
        renderChildCategories:function(list){
            var len = list.length
            if(len>0){
                var html = '<ul>'
                for(var i= 0 ;i<len;i++){
                    html += `<li class="child-item">
                                <a href="#">
                                    <img src="${list[i].icon}" alt="">
                                    <p>'${list[i].name}'</p>
                                </a>
                            </li>`
                }
                html += '</ul>'
                this.childCategories.innerHTML = html
            }         
        },
        handleCarousel:function(){
            var _this = this
            utils.ajax({
                url:'/ads/positionAds',
                data:{
                    position:1
                },
                success:function(data){
                    if(data.code == 0){
                        _this.renderCarousel(data.data)
                    }
                }
            })
        },
        renderCarousel:function(list){
            var imgs = list.map(function(item){
                return item.image
            })
            new SlideCarousel({
                id: 'swiper',
                imgs: imgs,
                width: 862,
                height: 440,
                playInterval: 2000
            })
        },
        handlehotProductList:function(){
            var _this = this
            utils.ajax({
                url:'/products/hot',
                success:function(data){
                    if(data.code == 0){
                        _this.renderHotProductList(data.data)
                    }
                } 
            })
        },
        renderHotProductList:function(list){
            var len = list.length
            if(len>0){
                var html = ''
                for(var i=0;i<len;i++){
                    html += `<li class="product-item col-1 col-gap">
                                <a href="#">
                                    <img src="${list[i].mainImage}" width="180px" height="180px"> 
                                        <p class="product-name">${list[i].name}</p>
                                    <div class="product-price-number">
                                        <span class="product-price">&yen;${list[i].price}</span>
                                        <span class="product-number">${list[i].payNums}人已购买</span>
                                    </div>
                                </a>
                            </li>`
                }
                this.hotProductList.innerHTML = html
            }
        },
        handleFloor:function(){
            var _this = this
            utils.ajax({
                url:'/floors',
                success:function(data){
                    _this.renderFloor(data.data)
                }
            })
        },
        renderFloor:function(list){
            var len = list.length
                var html = ''
                var elevatorHtml = ''
                for(var i =0;i<len;i++){
                    html += `<div class="floor-swap1">
                                <a href="#" class="hd">
                                    <h2>F${list[i].num} ${list[i].title}</h2>
                                </a>
                            </div>
                            <div class="floor-product ">
                                <ul class="prouct-list clearfix">`
                    for(var j = 0,len1= list[i].products.length;j<len1;j++){
                        var product = list[i].products[j]
                        html +=     `<li class="product-item col-1 col-gap">
                                        <a href="#">
                                            <img src="${product.mainImage}" width="180px" height="180px"> 
                                                <p class="product-name">${product.name}</p>
                                            <div class="product-price-number">
                                                <span class="product-price">&yen;${product.price}</span>
                                                <span class="product-number">${product.payNums}人已购买</span>
                                            </div>
                                        </a>
                                    </li>`
                    }
                        html += `</ul>
                            </div>`
                        elevatorHtml +=`<a href="javascript:;" class="elevator-item">
                                            <span class="elevator-item-num">F${list[i].num}</span>
                                            <span class="elevator-item-text text-ellipsis" data-num="${i}">${list[i].title}</span>
                                        </a>`
                }
                elevatorHtml += `<a href="javascript:;" class="backToTop" >
                                     <span class="elevator-item-num"><i class="iconfont icon-arrow-up"></i></span>
                                     <span class="elevator-item-text text-ellipsis" id="backToTop">顶部</span>
                                 </a>`
                this.floorContainer.innerHTML = html
                this.elevator.innerHTML = elevatorHtml
                this.floors = d.querySelectorAll('.floor-swap1')
                console.log(this.floors)
                this.elevatorItems = d.querySelectorAll('.elevator-item')
                
        },
        handleElevator:function(){
            var _this = this 
            //点击楼层返回到楼层显示区域
            this.elevator.addEventListener('click',function(ev){
                var elem = ev.target
                if(elem.id == 'backToTop'){
                    d.documentElement.scrollTop = 0
                }else if(elem.className == 'elevator-item-text text-ellipsis'){
                    var num = elem.getAttribute('data-num')
                    if(!_this.floors){
                        teturn
                    }
                    var floor = _this.floors[num]
                    d.documentElement.scrollTop = floor.offsetTop
                }
            },false)
             //楼层进入可视区设置电梯状态
             var betterSetElevator = function(){
                 
                 if(_this.elevatorTimer){
                     clearTimeout(_this.elevatorTimer)
                 }
                 _this.elevatorTimer = setTimeout(function(){
                    
                     _this.setElevator()     
                },200)
             }
             w.addEventListener('scroll',betterSetElevator,false)
             
             w.addEventListener('resize',betterSetElevator,false)
             
             w.addEventListener('load',betterSetElevator,false)
        },
        setElevator:function(){
            if (!this.elevatorItems){
                return
            }
            
            var num = this.getFloorNum()
            
            if(num == -1){
                utils.hide(this.elevator)
            }else{
                utils.show(this.elevator)
                for(var i = 0,len = this.elevatorItems.length;i<len;i++){
                    if (num == i) {
                        this.elevatorItems[i].className = 'elevator-item elevator-active'
                    } else {
                        this.elevatorItems[i].className = 'elevator-item'
                    }
                }
            }

        },
        getFloorNum:function(){
            
            var num = -1
           
            if(!this.floors){
                return num
            }
            for(var i=0,len = this.floors.length;i<len;i++){
                var floor = this.floors[i]
                
                num = i
                if(floor.offsetTop > d.documentElement.scrollTop + d.documentElement.clientHeight / 2){
                    num = i - 1
                    break
                }
            }
            return num
        }
    }
    
    
    page.init()    
})(window,document);



