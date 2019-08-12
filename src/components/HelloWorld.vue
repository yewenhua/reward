<template>
  <div class="hello">
      <div class="header">
        <img src="../assets/header.png" class="h">
        <div class="total">
            <img src="../assets/suipian.png" class="suipian">
            <img src="../assets/total_money.png" class="total_money">
            <div class="money">
                <ul id="reward">
                    <li v-for="(item, index) in reward_len">
                        <div class="scroll-num" :style="{top: animation_reward[index] + 'px'}">
                            <div class="unit-num">
                                <span class="iconfont icon-0"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-1"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-2"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-3"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-4"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-5"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-6"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-7"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-8"></span>
                            </div>
                            <div class="unit-num">
                                <span class="iconfont icon-9"></span>
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="desc">实时累计奖金池</div>
            </div>
        </div>
      </div>
      <div class="middle">
          <div class="bg_up">
              <div class="bg_title">
                  <img src="../assets/title.png" class="title_img">
                  <div class="title">{{isAnswer ? '您已答题，请静待开奖' : '答题获取抽奖资格'}}</div>
              </div>
          </div>
          <div class="bg_middle">
              <div class="title" v-if="!isAnswer">浙江亚合大机电科技有限公司的指纹锁叫什么名字？</div>
              <div class="title" v-if="isAnswer">活动从2018-12-10 12:45:12开始，已有{{participantCount}}人参与，奖金池满5万即开奖</div>
              <cube-checker v-model="checkerValue" :options="options" type="radio" class="checker-diy" v-if="!isAnswer"/>
              <div class="tb-bd" v-if="isAnswer">
                  <table class="tb">
                      <thead>
                          <tr>
                              <th>抽奖码</th>
                              <th>邀请用户</th>
                              <th>获得时间</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr v-for="(item, index) in lotteryCodes">
                              <td>{{item.code}}</td>
                              <td><div class="name">{{item.nickname}}</div></td>
                              <td>{{item.createDate}}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
          <div class="bg_down">
              <img src="../assets/sb_btn.png" class="sb_btn" v-if="!isAnswer" @click="sbmit">
              <img src="../assets/invite_btn.png" class="sb_btn" v-if="isAnswer" @click="shareCb">
          </div>
      </div>
      <div class="bottom">
          <div class="inner">

          </div>
      </div>
      <div :class="showModal ? 'pop dialog-main' : 'pop'" v-if="showModal">
          <div class="mask" @click="hideDialog"></div>
          <div class="content">
              <img src="../assets/bp.png" class="bp">
              <div class="t-bg">
                  <div class="title">恭喜您答题成功！</div>
                  <div class="title">您将有资格获取抽中5万元的中奖机会</div>
              </div>
              <ul class="code">
                  <li v-for="(item, index) in answerLottery">{{item}}</li>
              </ul>
              <div class="invite">
                  <img src="../assets/invite_btn.png" @click="shareCb">
              </div>
              <div class="share-desc">点击右上角圆点分享给好友</div>
          </div>
      </div>
  </div>
</template>

<script>
    import Vue from 'vue'
    import {
        Checker,
        Toast,
        Style
    } from 'cube-ui'

    Vue.use(Checker);
    Vue.use(Toast);
    Vue.use(Style);

    export default {
        data () {
            return {
                num: 0,
                participantCount: 0,
                reward_len: 5,
                animation_reward: [],
                isAnswer: false,
                loading: false,
                checkerValue: '',
                answerLottery: [],
                selfCode: '',
                shareCode: '',
                wxinit: false,
                ws_url: 'ws://lottery.voc.so',
                showModal: false,
                lotteryCodes: [],
                options: [
                    {
                        value: 1,
                        text: 'VPC'
                    },
                    {
                        value: 2,
                        text: 'VKC'
                    },
                    {
                        value: 3,
                        text: 'OKC'
                    },
                    {
                        value: 4,
                        text: 'VOC'
                    }
                ],
                lockReconnect: false,
                tt: '',
                timeout: 55000,//55s
                timeoutObj: null,
                serverTimeoutObj: null,
                websocket: null,
                third_session: sessionStorage.getItem('third_session')
            }
        },
        methods: {
            sign(){
                this.axios({
                    method: 'get',
                    url: '/app/wxConfig?third_session=' + this.third_session,
                    params: {
                        url: location.href.split('#')[0],
                    },
                }).then(function (response) {
                    if (response.status == 200 && response.data.code == 0) {
                        this.init(response.data.data);
                    }
                    else if (response.status == 200 && response.data.code == 3301) {
                        location.href= "/app/index";
                    }
                }.bind(this)).catch(function (error) {

                }.bind(this));
            },
            init(data){
                var that = this;
                if(typeof WeixinJSBridge == "undefined"){
                    if(document.addEventListener){
                        document.addEventListener('WeixinJSBridgeReady', wechat, false);
                    }
                    else if(document.attachEvent){
                        document.attachEvent('WeixinJSBridgeReady', wechat);
                        document.attachEvent('onWeixinJSBridgeReady', wechat);
                    }
                }
                else{
                    wechat();
                }

                function wechat(){
                    console.log(data)
                    wx.config({
                        debug:false,
                        signature: data.signature,
                        appId: data.appId,
                        timestamp: data.timestamp,
                        nonceStr: data.nonceStr,
                        jsApiList: [
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
                        ],
                    });
                    wx.ready(function(){
                        that.wxinit = true;
                        let url = location.href.split('#')[0];
                        //let base_url = url.split('?')[0];
                        let base_url = 'http://lottery.voc.so/app/redirect/index';
                        let share_url = base_url + '?share_code=' + that.selfCode;

                        wx.onMenuShareAppMessage({
                            title: '竞猜赢取5万头奖',
                            desc: '快来啊，竞猜赢取5万头奖',
                            link: share_url,
                            imgUrl: 'http://lottery.voc.so/static/img/vhome_01.jpg',
                            type: '', // 分享类型,music、video或link，不填默认为link
                            dataUrl: '', //如果type是music或video，则要提供数据链接，默认为空
                            success: function(){
                                // 用户确认分享后执行的回调函数
                                console.log('SUCCESS');
                            },
                            cancel: function(){
                                // 用户取消分享后执行的回调函数
                                console.log('FAIL');
                            }
                        });

                        wx.onMenuShareTimeline({
                            title: '竞猜赢取5万头奖',
                            link: share_url, // 分享链接
                            imgUrl: 'http://lottery.voc.so/static/img/vhome_01.jpg', // 分享图标
                            success: function(){
                                // 用户确认分享后执行的回调函数
                                console.log('SUCCESS');
                            },
                            cancel: function(){
                                // 用户取消分享后执行的回调函数
                                console.log('FAIL');
                            }
                        });
                    });
                    wx.error(function(res){
                        that.wxinit = false;
                    });
                }
            },
            show_reward_num(n) {
                let len = String(n).length;
                this.reward_len = len;

                let char = String(n).split("");
                // h存储数字块高度
                let h = '';
                let dom = document.querySelectorAll("#reward .unit-num") ? (document.querySelectorAll("#reward .unit-num"))[0] : null;
                let rect = (document.querySelectorAll("#reward .unit-num"))[0].getBoundingClientRect();
                h = rect.height;
                // 这里用数组存储所有动画 方便for循环出来的view绑定不同animation
                let animate = [];
                for (let i = 0; i < len; i++) {
                    animate[i] = -h * char[i];
                }
                this.animation_reward = animate;
            },
            showToastLoading (text = '加载中...') {
                this.toast = this.$createToast({
                    txt: text,
                    mask: true
                })
                this.toast.show();
            },
            hideToastLoading (){
                this.toast.hide();
            },
            showToastMsg(type, msg, time=1000){
                this.$createToast({
                    type: type,
                    time: time,
                    txt: msg
                }).show();
            },
            sbmit(){
                if(this.checkerValue != '') {
                    if (this.checkerValue != 4) {
                        this.showToastMsg('txt', '回答错误');
                    }
                    else {
                        if (!this.loading) {
                            this.showToastLoading('回答正确,兑奖券生成中…');
                            this.loading = true;
                            this.axios({
                                method: 'post',
                                url: '/app/member/answerSuccess?third_session=' + this.third_session,
                                data: {

                                },
                            }).then(function (response) {
                                this.hideToastLoading();
                                this.loading = false;
                                if (response.status == 200 && response.data.code == 0) {
                                    this.showModal = true;
                                    this.isAnswer = true;
                                    let charArr = String(response.data.data).split("");
                                    this.answerLottery = charArr;
                                    this.info(()=>{});
                                }
                                else {
                                    this.showToastMsg('txt', response.data.msg);
                                }
                            }.bind(this)).catch(function (error) {
                                this.hideToastLoading();
                                this.showToastMsg('txt', '提交失败');
                                this.loading = false;
                            }.bind(this));
                        }
                    }
                }
                else{
                    this.showToastMsg('txt', '请先答题');
                }
            },
            shareCb(){
                this.showToastMsg('txt', '请点击右上角圆点分享', 3000);
            },
            hideDialog() {
                this.showModal = false;
            },
            getQueryString(name){
                let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
                let r = window.location.search.substr(1).match(reg); //search,查询？后面的参数，并匹配正则
                if(r!=null)return  unescape(r[2]); return null;
            },
            info(cb){
                if(!this.loading) {
                    this.showToastLoading();
                    this.loading = true;
                    this.axios({
                        method: 'get',
                        url: '/app/currentMember?third_session=' + this.third_session,
                        params: {

                        },
                    }).then(function (response) {
                        this.hideToastLoading();
                        this.loading = false;
                        if (response.status == 200 && response.data.code == 0) {
                            this.selfCode = response.data.data.shareCode;
                            this.lotteryCodes = response.data.data.lotteryCodes;
                            if(response.data.data.lotteryCodes.length > 0){
                                this.isAnswer = true;
                            }
                            cb();
                        }
                        else {
                            this.showToastMsg('txt', response.data.msg);
                        }
                    }.bind(this)).catch(function (error) {
                        this.hideToastLoading();
                        this.showToastMsg('txt', '获取失败');
                        this.loading = false;
                    }.bind(this));
                }
            },
            share(cb){
                if(!this.loading) {
                    this.showToastLoading();
                    this.loading = true;
                    this.axios({
                        method: 'post',
                        url: '/app/member/shareSuccess/' + this.shareCode + '?third_session=' + this.third_session,
                        data: {
                            shareCode: this.shareCode
                        },
                    }).then(function (response) {
                        this.hideToastLoading();
                        this.loading = false;
                        if (response.status == 200 && response.data.code == 0) {

                        }
                        else {
                            this.showToastMsg('txt', response.data.msg);
                        }
                        cb();
                    }.bind(this)).catch(function (error) {
                        this.hideToastLoading();
                        this.showToastMsg('txt', '分享失败');
                        this.loading = false;
                        cb();
                    }.bind(this));
                }
            },
            rand(min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            },
            animate_num(){
                let animate_num = this.num;
                let len = String(this.num).length;
                if(len < 5){
                    switch(len){
                        case 1:
                            animate_num = '0000' + animate_num;
                            break;
                        case 2:
                            animate_num = '000' + animate_num;
                            break;
                        case 3:
                            animate_num = '00' + animate_num;
                            break;
                        case 4:
                            animate_num = '0' + animate_num;
                            break;
                    }
                }
                return animate_num;
            },
            initWebSocket(){
                console.log("initWebSocket");
                const wsuri = this.ws_url + "/webSocket?third_session=" + this.third_session;
                //const wsuri = this.ws_url + "/app/webSocket?third_session=ca37cc2440d74771ab1dd51d64b0b7ca";
                this.websocket = new WebSocket(wsuri);
                this.websocket.onopen = this.websocketonopen;
                this.websocket.onerror = this.websocketonerror;
                this.websocket.onmessage = this.websocketonmessage;
                this.websocket.onclose = this.websocketclose;
            },
            websocketonopen() {
                console.log("WebSocket连接成功");
                this.start();
            },
            websocketonerror(e) {
                console.log("WebSocket连接发生错误");
                this.reconnect();
            },
            websocketonmessage(e){
                this.reset();
                let obj = JSON.parse(e.data)
                let that = this;
                if(obj && obj.data && obj.data.totalAmount && obj.data.participantCount) {
                    that.num = parseInt(obj.data.totalAmount);
                    that.participantCount = obj.data.participantCount;

                    setTimeout(()=>{
                        let animate_num = that.animate_num();
                        that.show_reward_num(animate_num);
                    }, 300);
                }
            },
            websocketclose(e){
                console.log("connection closed");
                this.reconnect();
            },
            reconnect(){
                console.log("reconnect");
                if(!this.lockReconnect){
                    this.lockReconnect = true;
                    //没连接上会一直重连，设置延迟避免请求过多
                    this.tt && clearTimeout(this.tt);
                    this.tt = setTimeout(()=>{
                        this.initWebSocket();
                        this.lockReconnect = false;
                    }, 4000);
                }
            },
            reset(){
                console.log("reset");
                clearTimeout(this.timeoutObj);
                clearTimeout(this.serverTimeoutObj);
                this.start();
            },
            start(){
                console.log("start");
                //距离上次从后端获取到消息超过60秒之后，执行心跳检测
                var self = this;
                this.timeoutObj = setTimeout(function(){
                    self.websocket.send("HeartBeat");
                    self.serverTimeoutObj = setTimeout(function(){
                        this.websocket.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                    }, self.timeout)
                }, this.timeout)
            },
        },
        mounted(){
            let that = this;
            let code = that.getQueryString('share_code');
            that.shareCode = code;
            that.$nextTick(() => {
                setTimeout(()=>{
                    let animate_num = that.animate_num();
                    that.show_reward_num(animate_num);
                }, 300);

                that.initWebSocket();
                if(that.shareCode){
                    that.share(()=>{
                        that.info(()=>{
                            that.sign();
                        });
                    });
                }
                else{
                    that.info(()=>{
                        that.sign();
                    });
                }
            });
        },
        destroyed(){
            this.websocketclose();
        }
    }
</script>

<style>
    @import "../assets/font/iconfont.css";
    .iconfont{
        font-size: 0.48rem;
    }
    .header{
        width: 100%;
        position: relative;
    }
    .header img.h{
        width: 100%;
        display: block;
    }
    .header .total{
        position: absolute;
        left: 0.12rem;
        bottom: -0.2rem;
        width: calc( 100% - 0.24rem );
        height: 1.38rem;
        background: #D4271F;
        box-shadow: 0 5px 10px 0 rgba(255,7,7,0.41), inset 0 3px 0 0 rgba(0,0,0,0.16);
        border-radius: 5px;
    }
    .header .total img.suipian{
        display: block;
        box-sizing: border-box;
        margin-left: 0.1rem;
        margin-right: 0.1rem;
        margin-top: 0.1rem;
        width: calc( 100% - 0.2rem );
    }
    .header .total img.total_money {
        display: block;
        position: absolute;
        left: 50%;
        top: -0.12rem;
        transform: translateX(-50%);
        height: 0.6rem;
    }
    .header .total .money{
        position: relative;
        width: 100%;
        height: 0.55rem;
        margin-top: 0.1rem;
    }
    .header .total .money ul{
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
    .header .total .money li{
        height: 0.55rem;
        width: 0.55rem;
        background: #B40000;
        border-radius: 0.05rem;
        color: #feef7e;
        font-size: 0.48rem;
        margin: 0 0.05rem;
        overflow: hidden;
    }
    .header .total .money li .scroll-num{
        position: relative;
        top: 0;
        transition: top 1.5s;
    }
    .header .total .money li .unit-num{
        height: 0.55rem;
        width: 0.55rem;
        line-height: 0.55rem;
        text-align: center;
        overflow: hidden;
        font-family: impact;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .header .total .money .desc{
        font-family: PingFangSC-Semibold;
        font-size: 0.12rem;
        color: #FEDD92;
        width: 100%;
        text-align: center;
        margin-top: 0.1rem;
    }
    .middle{
        margin-top: 0.36rem;
        width: 100%;
        box-sizing: border-box;
    }
    .bg_up{
        background: url(../assets/bg_up.png);
        background-repeat: no-repeat;
        background-size: 100% 100%;
        height: 1.2rem;
        position: relative;
        padding-top: 0.5rem;
        box-sizing: border-box;
    }
    .bg_middle{
        background: url(../assets/bg_middle.png);
        background-repeat: repeat;
        background-size: 100%;
        min-height: 1rem;
        position: relative;
        top:-0.01rem;
    }
    .bg_down{
        background: url(../assets/bg_down.png);
        background-repeat: no-repeat;
        background-size: 100%;
        height: 0.66rem;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        top:-0.02rem;
    }
    .bg_title{
        height: 0.3rem;
        position: relative;
        font-size: 0.13rem;
        font-family: PingFangSC-Semibold;
        color: #B20000;
    }
    .bg_title .title{
        display: block;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate( -50%, -50% );
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .title_img{
        height: 100%;
    }
    .bg_down .sb_btn{
        height: 0.48rem;
        display: block;
    }
    .bottom{
        padding: 0.02rem 0.12rem 0.15rem;
        width: 100%;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }
    .bottom .inner{
        width: 100%;
        min-height: 2rem;
        background: #D4271F;
        box-shadow: 0 5px 10px 0 rgba(255,7,7,0.41);
        border-radius: 5px;
    }
    .bg_middle .title{
        font-family: PingFangSC-Semibold;
        font-size: 0.14rem;
        text-align: justify;
        line-height: 0.2rem;
        color: #FEDD92;
        letter-spacing: 0;
        width: 100%;
        padding: 0 0.8rem;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        position: relative;
        top: -0.2rem
    }
    .cube-checker.checker-diy{
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        position: relative;
        margin-top: 0.1rem;
    }
    .bg_middle .cube-checker-item{
        margin: 0 0.05rem;
        padding: 0.08rem 0.18rem;
        border-radius: 0.03rem;
        border: none;
        font-size: 0.14rem;
    }
    .bg_middle .cube-checker-item_active{
        color: #D4271F;
        font-weight: bold;
        background: #FEDD92;
        border: none;
    }
    .bg_middle .cube-checker.checker-diy .cube-checker-item_active::after{
        border-width: 0;
    }
    .tb-bd{
        width: 100%;
        box-sizing: border-box;
        padding: 0.1rem 0.4rem;
    }
    .tb{
        width: 100%;
        margin: 0;
        border-collapse: collapse;
        border-spacing: 0;
        border: 0.01rem solid #b40000;
    }
    .tb thead{
        color: #ff7979;
    }
    .tb thead th{
        padding-top: 0.05rem;
        padding-bottom: 0.05rem;
        font-size: 0.12rem;
    }
    .tb tbody td{
        padding-top: 0.08rem;
        padding-bottom: 0.08rem;
        font-size: 0.12rem;
    }
    .tb tbody tr td{
        border-right: 0.01rem solid #b40000;
        text-align: center;
    }
    .tb tbody tr td:last-child{
        border-right: none;
    }
    .tb tbody{
        color: #FEDD92;
    }
    .tb tr{
        border: 1px solid #b40000;
    }
    .tb thead{
        background: #b40000;
    }
    .tb .name{
        width: 0.8rem;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: inline-block;
    }
    .pop{
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
    .pop .mask{
        position: absolute;
        background-color:#25262d;
        opacity:.6;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }
    .pop .content{
        position: absolute;
        width: 3.2rem;
        min-height: 3.6rem;
        background: url(../assets/pop_bg.png);
        background-size: 100% 100%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    .pop .bp{
        position: absolute;
        right: -0.26rem;
        top: 0.3rem;
        width: 0.9rem;
    }
    .pop .t-bg{
        margin-top: 0.8rem;
    }
    .pop .title{
        color: #FEDD92;
        font-size: 0.2rem;
        line-height: 0.32rem;
        width:  100%;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        padding: 0 0.4rem;
    }
    .pop ul{
        list-style: none;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 0.6rem;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-top: 0.1rem;
    }
    .pop li{
        height: 0.48rem;
        width: 0.48rem;
        line-height: 0.48rem;
        text-align: center;
        overflow: hidden;
        font-family: impact;
        background: #B40000;
        border-radius: 0.05rem;
        color: #feef7e;
        font-size: 0.4rem;
        margin: 0 0.05rem;
    }
    .pop .invite{
        display: flex;
        width: 100%;
        height: 0.6rem;
        justify-content: center;
        align-items: center;
        margin-top: 0.15rem;
        margin-bottom: 0.05rem;
    }
    .pop .invite img{
        height: 0.42rem;
        display: block;
    }
    .pop .share-desc{
        text-align: center;
        color: #FEDD92;
        font-size: 0.14rem;
    }
    .dialog-main{-webkit-animation:dialog-zoom .4s;animation:dialog-zoom .4s}
    .cube-toast-icon{
        position: relative;
        font-size: 0.24rem;
        width: 0.24rem;
        height: 0.24rem;
    }
    .cube-toast-icon:before{
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
    }
    [class*=" cubeic-"], [class^=cubeic-]{
        font-size: 0.24rem;
        width: 0.24rem;
        height: 0.24rem;
    }
    @-webkit-keyframes dialog-zoom{
        0%{-webkit-transform:scale(0);transform:scale(0)}
        50%{-webkit-transform:scale(1.1);transform:scale(1.1) }
        to{-webkit-transform:scale(1);transform:scale(1)}
    }
    @keyframes dialog-zoom{
        0%{-webkit-transform:scale(0);transform:scale(0)}
        50%{-webkit-transform:scale(1.1);transform:scale(1.1)}
        to{-webkit-transform:scale(1);transform:scale(1)}
    }
</style>
