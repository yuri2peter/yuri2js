const cookie=require('cookie');
const yuri2=require('../../yuri2');
const session_id_name='yuri2-js-session-id';

class Cookie {
    constructor(ctx){
        this.ctx=ctx;
    }
    parse(){
        return cookie.parse(this.ctx.$req.headers.cookie || '');
    }
    serialize(name,value,options=3*30*24*3600){
        if(!isNaN(options)){options={maxAge:options}}
        if(yuri2.isJson(value)){value=JSON.stringify(value)}
        let str=cookie.serialize(name, String(value), options);
        this.ctx.res.setHeader('Set-Cookie',str,false);
    }
}

let sessionData={};
class Session{
    constructor(ctx){
        this.ctx=ctx;
        this.id=ctx.req.cookies[this._getIdName()];
        if(!this.id){
            let id=yuri2.uuid();
            this.id=id;
            this.ctx.res.setCookie(this._getIdName(),id,{});
        }
    }
    _getIdName(){
        return session_id_name+'_'+this.ctx.server.data.name;
    }
    load(){
        //尝试内存读取id
        let session=sessionData[this.id];
        if(session){
            //有
            this.ctx.session=session.data;//读取数据
            session.visit=yuri2.timestamp();//刷新访问时间
        }else{
            //木有
            sessionData[this.id]={
                data:{},
                visit:yuri2.timestamp()
            };
            this.ctx.session={};
        }
    }
    save(){
        sessionData[this.id]={
            data:this.ctx.session,
            visit:yuri2.timestamp()
        };
    }
    static gc(chance=0.01){
        let timeNow=yuri2.timestamp();
        if(Math.random()<chance){
            for(let i in sessionData){
                let session=sessionData[i];
                if(session.visit+600<timeNow){
                    //过期清理
                    delete sessionData[i];
                }
            }
        }
    }
}

module.exports=function (server) {
    if(server){
        //注册关闭事件，保存session到本地

    }
    return async function (ctx,next) {
        Session.gc();
        let c=new Cookie(ctx);
        ctx.req.cookies=c.parse();
        ctx.res.setCookie=function (name,value,options=3*30*24*3600) {
            c.serialize(name,value,options);
        };

        let s=new Session(ctx);
        ctx.req.sessions=s.load();
        await next();
        ctx.req.sessions=s.save();
    };
};