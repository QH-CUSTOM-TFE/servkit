# servkit
主-从 应用架构的一种实现，目的是通过主应用提供的标准接口来实现从应用二次开发（二方/三方），以实现主应用的平台性开放能力。

基于能力特性，servkit能够做：
* 对于平台性的前端应用（通常是复杂的），可以做小程序基础框架和SDK；
* 对于复杂的前端巨应用，可以做微前端的架构实践；
* 对于简单的前端页面，可以作为基础的RPC通信库；

能力特性：
* 微应用架构：主应用-从应用
* 三方应用开放能力
  * 小程序
  * 定制化SDK
  * 服务/API管理
  * 权限管理：应用粒度、服务粒度、API粒度
* 声明式服务API
* 声明式服务事件
* RPC通信协议

# 为什么要开发 servkit ?
* GUI应用H5化

  在GUI程序的领域，传统的原生开发逐步被H5 WEB技术所取代，因为H5表现出了非常优秀的开发体验和生产效率，这在PC平台尤为明显；那么H5 WEB技术面临的是更为复杂的软件工程和系统程序。
* 云端化
  
  云端化将一直保持主旋律，当前在终端操作的软件系统会越来越多的向云端发展，而WEB技术作为云端的主要技术之一，WEB前端领域会面临更多传统软件系统的开发挑战，工程规模、系统复杂度、架构设计等（在工程化上已经能看到一些变化在应对这些挑战，比如TypeScript,Webpack等）。
* 开放能力
  
  SAAS服务应该是开放的。对于范服务的提供商，通过提供开放能力，让上下游生态、周边生态、行业细分生态等能够接入，达到能力互补/能力创新（服务场景拓宽）；一体化是目的，开放和封闭都是实现路径，但是封闭的一体化方案，ROI可能较低，自建意味更多的人力、财力、时间，对于客户也缺少服务弹性。


在这个背景下，在技术角度看，要应对的是巨型应用；在业务角度看，要应对的是开放能力。而这些也会是WEB领域发展的共性问题，所以servkit针对这些问题，尝试提供一个通用处理方案；巨型应用使用微前端架构（SOA）思路，开放能力使用小程序架构思路。

# 快速使用
## 安装
`npm install servkit` 或者`yarn add servkit`

## IFrame场景
IFrame页面间通信是最常见的场景，这种场景分为承载页（打开iframe页面）和内容页（iframe页面），servkit在这个场景提供了：
* 语义化操作：iframe的打开、页面间通信，而无需关注底层琐碎代码的开发；
* 规范化通信：基于提供的service机制，规范了RPC通信间协议，也提供了通信间的类型检测；

相互间的关系：

承载页 -> sappMGR -> service decl <- sappSDK <- IFrame

### 承载页面代码
打开页面:

``` typescript
// 在承载页面都通过sappMGR进行操作
import { sappMGR } from 'servkit';
import { CommonService } from 'servkit-service-decl';
import { CommonServiceImpl } from './service/CommonServiceImpl';

sappMGR.create(
{
    // 页面的ID
    id: 'com.page.demo',
    // 页面的版本
    version: '1.0.0',
    // 页面的名称
    name: 'demo',
    // 页面的地址
    url: 'https://www.demo.com',
    // 页面的可选参数
    options: {
    }
}, 
{
    // 页面布局相关配置
    layout: {
        // iframe元素挂载的容器DOM元素
        container: domElement,
    },
    // 配置承载页面向iframe页面提供的服务，iframe页面可直接调用相应的服务API
    services: [
        // 注册CommonService
        {
            // 服务声明，类型声明会和iframe进行共享，保证了API的类型检查 
            decl: CommonService,
            // 服务实现，实现只存在与承载页代码之中，iframe页面不感知
            impl: CommonServiceImpl
        },
    ],
}).then((app) => {
    // 页面创建成功，app为对应iframe的抽象体；
    // 可通过app直接与iframe通信，以及显示、隐藏和关闭操作
}).catch((e) => {
    // 页面创建失败
});

```

声明服务:
``` typescript
// CommonService.ts
// 服务声明通常单独放在一个npm包里面，能够给实现方和使用方进行共享使用
import { ServService, ServEventer, anno, ServAPIArgs, ServAPIRetn, API_UNSUPPORT } from 'servkit';

// 声明一个服务class，该class定义了IFrame间的通信语义，类型声明
@anno.decl({
    // 服务id
    id: 'demo.service.common',
    // 服务版本
    version: '1.0.0',
})
export class CommonService extends ServService {
    // 声明一个服务notify型api，notify型的api不带有返回数据；
    // 参数为一个字符串；
    @anno.decl.notify()
    message(args: ServAPIArgs<string>): ServAPIRetn {
        return API_UNSUPPORT();
    }

    // 声明一个服务api，具有返回数据；
    // 参数为一个字符串，返回boolean值；
    @anno.decl.api()
    confirm(args: ServAPIArgs<string>): ServAPIRetn<boolean> {
        return API_UNSUPPORT();
    }
}
```

实现服务:
``` typescript
// CommonService.ts
// 服务声明通常单独放在一个npm包里面，能够给实现方和使用方进行共享使用
import { CommonService } from 'servkit-service-decl';
import { anno, ServAPIArgs, ServAPIRetn, API_SUCCEED, DeferredUtil } from 'servkit';
// 通过antd实现message和confirm
import message from 'antd/lib/message';
import 'antd/lib/message/style/css';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/css';

// 实现一个服务class
@anno.impl()
export class CommonServiceImpl extends CommonService {
    // 实现message接口
    message(args: ServAPIArgs<string>): ServAPIRetn {
        message.success(args);
        return API_SUCCEED();
    }

    // 实现confirm接口
    confirm(args: ServAPIArgs<string>): ServAPIRetn<boolean> {
        const deffered = DeferredUtil.create<boolean>();
        Modal.confirm({
            title: '确认',
            content: args,
            onCancel: () => {
                deffered.resolve(false);
            },
            onOk: () => {
                deffered.resolve(true);
            }
        })
        return deffered;
    }
}
```

### 内容页面相关代码
启动页面:
``` typescript
// 在内容页面都通过sappSDK进行操作
import { sappSDK } from 'servkit';
import { IFrameCommonService } from 'servkit-service-decl';
import { IFrameCommonServiceImpl } from './service/CommonServiceImpl';

sappSDK
.setConfig(
{
    // 配置iframe页面向承载页面提供的服务，承载页面可直接调用相应的服务API
    services: [
        // 注册IFrameCommonService
        {
            // 服务声明，类型声明会和iframe进行共享，保证了API的类型检查 
            decl: IFrameCommonService,
            // 服务实现，实现只存在与承载页代码之中，iframe页面不感知
            impl: IFrameCommonServiceImpl
        },
    ],
})
// 启动内容页面
.start()
.then((app) => {
    // 页面创建成功，app为对应iframe的抽象体；
    // 可通过app直接与承载页进行通信，以及关闭操作
}).catch((e) => {
    // 页面创建失败
});
```

页面通信:
``` typescript
import { sappSDK } from 'servkit';
import { CommonService } from 'servkit-service-decl';

// 获取服务
const common = await sappSDK.service(CommonService);
// 调用服务API
common.message('调用服务');
```

### 双向通信
这里只展示了从IFrame向承载页的单向通信，但**servkit提供了IFrame页面和承载页面的双向通信机制，IFrame自身也可以向承载页暴露服务**，具体使用与上述例子类似（不同点在于**承载页通过sappMGR.create后的app获取服务**）。

# Example
[EXAMPLE](https://github.com/QH-CUSTOM-TFE/servkit-example)

基于servkit的一个完整微应用拆分例子，包括了iframe微应用和异步微应用（保持了独立的特性，但仍然在一个页面内）。

# 为什么没有使用 qiankun、single-spa ?

微前端解决的问题：

1. 架构层面:
   * 巨型应用的拆分手段
   * 拆分后微应用的治理手段：运行机制、生命周期、通信能力等
2. 工程层面：
   * 微应用的独立性：独立构建、独立发布、独立更新
3. 组织层面：
   * 形成独立团队，独立运作（工程层面实现后，改点基本达成）


小程序面临的问题：

1. 独立性：基于SDK API，完全独立运作
2. 安全性：环境隔离、权限管控
3. 便利性：二方/三方开发简便


[single-spa](https://single-spa.js.org/) 在架构层面提供的能力比较基础，在工程层面没有相关涉及。如果要用到实际项目上，还需要做较多的额外内容，比如应用间通信。

[qiankun](https://qiankun.umijs.org/zh) 在 single-spa 之上提供更为完整的技术方案（比如运行沙盒、样式隔离等），在架构层面和工程层面更为成熟，是微前端开源体系中较好的选择。但是不适合做小程序体系，在安全性和独立性上不能适用于三方应用。


