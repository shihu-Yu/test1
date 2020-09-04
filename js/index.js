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
            

            this.searchTimer = null
            this.categoriesTimer = null
            this.isSearchLayerEmpty = true
            
            this.handleCart()
            this.handleSerach()
            this.handleCategories()
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
            this.searchInput.addEventListener('input',function(){
                if(_this.searchTimer){
                    clearTimeout(_this.searchTimer)
                }
                _this.searchTimer = setTimeout(function(){
                    _this.getSearchData()
                },500)
            },false)
            //获取焦点显示搜索提示层
            this.searchInput.addEventListener('focus', function () {
                if (!_this.isSearchLayerEmpty){
                    utils.show(_this.searchLayer)
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
            this.parentCategories.addEventListener('mouseover',function(ev){
                
                    if(_this.categoriesTimer){
                        clearTimeout(_this.categoriesTimer)
                    }
                    _this.categoriesTimer = setTimeout(function(){
                        var elem = ev.target
                        if(elem.className = 'parent-categories-item'){
                            utils.show(_this.childCategories)
                            
                            _this.getChildCategoriesData()
                        }
                     
                    },100)
              
            },false)
            this.parentCategories.addEventListener('mouseleave',function(){
                if(_this.categoriesTimer){
                    clearTimeout(_this.categoriesTimer)
                }
                utils.hide(_this.childCategories)
                
            })
        },
        getParentCategoriesData:function(){
            console.log(11)
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
           this.parentCategoriesItem = d.querySelectorAll('parent-categories-item') 
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
            }         
            html += '</ul>'
            this.childCategories.innerHTML = html
        }  
    }
    
    page.init()    
})(window,document);



