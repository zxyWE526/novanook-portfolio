'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ================================================================
   题库
   ================================================================ */

interface QItem {
  id: number;
  type: 'single' | 'multi' | 'judge' | 'fill';
  chapter: string;
  q: string;
  options?: string[];
  answer: string;
}

const QS: QItem[] = [
  // ===== 第1章 =====
  { id: 1,  type: 'single', chapter: '第1章', q: '下列不属于建站目的的是', options: ['形象宣传', '展示动态数据', '日常通讯', '开展电子商务'], answer: 'C' },
  { id: 2,  type: 'single', chapter: '第1章', q: '以下不是常用浏览器的是', options: ['Opera', 'Firefox', 'Safari', 'Oracle'], answer: 'D' },
  { id: 3,  type: 'single', chapter: '第1章', q: '下列不属于常用数据库技术的是', options: ['SQL Server', 'Access', 'Edge', 'MySQL'], answer: 'C' },
  { id: 4,  type: 'single', chapter: '第1章', q: '在电子商务网站建设规划中，以下哪一项不属于创建网站前的准备工作？', options: ['市场调研', '购买服务器', '设计网站Logo', '招聘员工'], answer: 'D' },
  { id: 5,  type: 'single', chapter: '第1章', q: '确定建站目的时，以下哪个选项不是常见的建站目的？', options: ['销售产品', '提供服务', '娱乐休闲', '信息传播'], answer: 'C' },
  { id: 6,  type: 'single', chapter: '第1章', q: '在规划建站阶段，以下哪一步骤是首先需要进行的？', options: ['设计网页布局', '确定网站功能需求', '编写代码', '测试网站'], answer: 'B' },
  { id: 7,  type: 'single', chapter: '第1章', q: '创建网站时，以下哪项不是必需的技术准备？', options: ['编程语言', '数据库技术', '搜索引擎优化', '前端框架'], answer: 'C' },
  { id: 8,  type: 'single', chapter: '第1章', q: '在电子商务网站建设过程中，以下哪一项不是规划阶段的主要工作？', options: ['制定项目计划', '确定网站架构', '编写用户手册', '设计数据库模型'], answer: 'C' },
  { id: 9,  type: 'judge', chapter: '第1章', q: '在电子商务网站建设规划中，确定建站目的是为了明确网站的目标用户群体和提供的服务类型。', answer: '对' },
  { id: 10, type: 'judge', chapter: '第1章', q: '创建网站前的准备工作包括市场调研、技术选型和团队组建，这些步骤可以并行进行以提高效率。', answer: '错' },
  { id: 11, type: 'judge', chapter: '第1章', q: '在电子商务网站建设规划中，规划建站阶段时，应考虑从需求分析到上线运营的每一个环节，确保每个阶段的任务清晰明确。', answer: '对' },
  { id: 12, type: 'judge', chapter: '第1章', q: '创建网站时，只需关注前端设计，后端技术并不重要。', answer: '错' },
  { id: 13, type: 'judge', chapter: '第1章', q: '电子商务网站建设规划中，确定建站目的应该放在整个规划过程的最后一步，以便更好地整合资源。', answer: '错' },

  // ===== 第2章 =====
  { id: 14, type: 'single', chapter: '第2章', q: '关于域名的说法下列错误的是', options: ['在全世界范围内，如果一个域名被注册，其他任何机构都无权再注册相同的域名', '注册自己的域名是有效保护企业的公共形象、商标、品牌等无形资产的重要行为', '选择一个较长的域名是网站成功的重要因素之一', '我国的国家代码顶级域名为.cn，CNNIC是我国的域名管理机构'], answer: 'C' },
  { id: 15, type: 'single', chapter: '第2章', q: '下列关于网站服务器的说法错误的是', options: ['自行管理服务器成本很高，稳定性差，安全性不高，运行环境差', '托管服务器由企业自行配置，稳定性好，安全性高，运行环境较好', '租用服务器无须用户自己购买服务器，由服务商提供网络服务器', '租用虚拟主机是一种基于云计算的新兴虚拟主机用于建站'], answer: 'D' },
  { id: 16, type: 'single', chapter: '第2章', q: '如果一家大型企业需要主机提供多种服务，并且对网站速度有较高要求，那么自行购买服务器之后，将自己的服务器托管在ISP的机房里，这种服务器解决方案是', options: ['虚拟主机', '主机托管', '主机租用', '自建主机'], answer: 'B' },
  { id: 17, type: 'single', chapter: '第2章', q: '以下不是主流的网络操作系统的是', options: ['Windows', 'Unix', 'Linux', 'Server'], answer: 'D' },
  { id: 18, type: 'single', chapter: '第2章', q: '下列不属于常用数据库技术的是', options: ['SQL Server', 'MySQL', 'Edge', 'Access'], answer: 'C' },
  { id: 19, type: 'single', chapter: '第2章', q: '在电子商务网站建设中，以下哪种方式最能体现企业的品牌形象？', options: ['使用免费的网站模板', '采用统一的设计风格和色彩搭配', '随意更改网站布局', '频繁更换网站主题'], answer: 'B' },
  { id: 20, type: 'single', chapter: '第2章', q: '在电子商务网站建设中，以下哪种方式最能提升网站的安全性？', options: ['使用免费的安全插件', '定期更新网站代码和插件', '忽略安全警告', '使用弱密码保护后台'], answer: 'B' },
  { id: 21, type: 'single', chapter: '第2章', q: '在进行企业网站功能配置时，以下哪项功能对于提升网站的转化率最为关键？', options: ['复杂的页面设计', '清晰的购物流程', '大量的广告展示', '频繁的弹窗提示'], answer: 'B' },
  { id: 22, type: 'single', chapter: '第2章', q: '在电子商务网站建设过程中，关于域名注册的描述，下列哪一项是正确的？', options: ['域名注册后可以立即投入使用，无需备案', '域名注册需要经过ICANN的审核才能生效', '域名注册时可以选择不同的顶级域名，如.com、.net、.org等', '域名注册后，可以无限期续费使用，无需担心过期问题'], answer: 'C' },
  { id: 23, type: 'single', chapter: '第2章', q: '在进行企业网站功能配置时，以下哪项功能对于提升用户体验最为关键？', options: ['丰富的广告展示', '快速响应的搜索功能', '复杂的导航菜单', '大量的文字介绍'], answer: 'B' },
  { id: 24, type: 'single', chapter: '第2章', q: '在进行域名注册时，以下哪个因素对企业来说最重要？', options: ['域名的长度', '域名与企业品牌的匹配度', '域名的价格', '域名的后缀类型'], answer: 'B' },
  { id: 25, type: 'single', chapter: '第2章', q: '在电子商务网站建设中，关于网站软件功能配置，以下哪项不是必须的功能？', options: ['用户管理功能', '内容管理系统（CMS）', '在线支付功能', '虚拟现实体验功能'], answer: 'D' },
  { id: 26, type: 'single', chapter: '第2章', q: '企业在选择建立网站的方式时，以下哪种方式最能体现企业的自主性和灵活性？', options: ['使用现成的网站模板', '购买成熟的网站系统并进行二次开发', '完全自建网站，从底层架构到前端设计全部自主完成', '租用服务器空间，使用第三方平台搭建网站'], answer: 'C' },
  { id: 27, type: 'single', chapter: '第2章', q: '关于企业网站软件的功能配置，以下哪项描述是正确的？', options: ['网站只需要展示产品信息即可', '网站需要具备用户交互功能，如留言、在线客服等', '网站不需要考虑搜索引擎优化', '网站只需要一个首页，不需要其他页面'], answer: 'B' },
  { id: 28, type: 'single', chapter: '第2章', q: '在电子商务网站建设中，以下哪种方式最能提升网站的用户粘性？', options: ['频繁更改网站主题', '提供个性化推荐和服务', '复杂的操作流程', '缺乏用户反馈渠道'], answer: 'B' },
  { id: 29, type: 'single', chapter: '第2章', q: '企业在选择建立网站的方式时，如果希望快速上线且成本较低，应选择哪种方式？', options: ['完全自建网站', '购买成熟的网站系统并进行二次开发', '使用现成的网站模板', '租用服务器空间，使用第三方平台搭建网站'], answer: 'C' },
  { id: 30, type: 'fill',  chapter: '第2章', q: '一种基于IP地址的层次化的主机命名方式是______。', answer: '域名' },
  { id: 31, type: 'fill',  chapter: '第2章', q: '在网络环境中为客户机提供某种服务的专用计算机是______。', answer: '服务器' },
  { id: 32, type: 'fill',  chapter: '第2章', q: '在电子商务网站建站过程中，选择______方式可以确保网站拥有独立的服务器资源，但需要自行承担服务器的维护和管理。', answer: '自建主机' },
  { id: 33, type: 'fill',  chapter: '第2章', q: '______是一种成本效益较高的建站方式，用户可以租用部分服务器资源，而无需购买和维护整个服务器。', answer: '主机租用' },
  { id: 34, type: 'fill',  chapter: '第2章', q: '______通常指将网站服务器托管在专业的数据中心，由专业团队负责维护和管理，这种方式可以确保网站的高可用性和安全性。', answer: '主机托管' },
  { id: 35, type: 'fill',  chapter: '第2章', q: '在______建站方式下，用户需要自行购买服务器硬件和软件，并承担所有与服务器相关的维护和管理责任。', answer: '自建主机' },
  { id: 36, type: 'judge', chapter: '第2章', q: '域名和网址完全是一回事。', answer: '错' },
  { id: 37, type: 'judge', chapter: '第2章', q: '每个域名在互联网上都是唯一的，域名注册机构保证全球范围内没有重复的域名。', answer: '对' },

  // ===== 第3章(1) =====
  { id: 38, type: 'single', chapter: '第3章(1)', q: '一个Web服务器的IP地址为211.78.60.19，网站端口号为8000，则要访问网站User中的Default.php的网址为', options: ['http://211.78.60.19/User/Default.php', 'http://211.78.60.19:8000/Default.php', 'http://User/Default.php', 'http://211.78.60.19:8000/User/Default.php'], answer: 'D' },
  { id: 39, type: 'single', chapter: '第3章(1)', q: '以下选项不属于编程语言的是', options: ['ASP.NET', 'Visual Basic', 'C#', 'PHP'], answer: 'A' },
  { id: 40, type: 'single', chapter: '第3章(1)', q: '下列哪项不属于动态网页技术', options: ['ASP.NET', 'PHP', 'JSP', 'HTML'], answer: 'D' },
  { id: 41, type: 'single', chapter: '第3章(1)', q: '可以不用发布就能在本地计算机上浏览的页面编写语言是', options: ['ASP', 'HTML', 'PHP', 'JSP'], answer: 'B' },
  { id: 42, type: 'single', chapter: '第3章(1)', q: '在PHP中，输出变量name的值，正确方式是', options: ['print name;', 'output name;', 'echo name;', 'display $name;'], answer: 'D' },
  { id: 43, type: 'single', chapter: '第3章(1)', q: '在PHP中，下列表示逻辑"或"运算的运算符是', options: ['&&', '||', '!', '&'], answer: 'B' },
  { id: 44, type: 'single', chapter: '第3章(1)', q: '在PHP中，注释的错误写法是', options: ['// 单行注释', '# 单行注释', '/* 多行注释 */', '* 单行注释'], answer: 'D' },
  { id: 45, type: 'single', chapter: '第3章(1)', q: '在PHP中，包含（引入）一个外部文件的写法是', options: ['include_once "file.php";', 'load "file.php";', 'include "file.php";', 'import "file.php";'], answer: 'C' },
  { id: 46, type: 'fill',  chapter: '第3章(1)', q: '在PHP中，声明一个整数变量my并赋值为10的语句是______。', answer: '$my=10' },
  { id: 47, type: 'fill',  chapter: '第3章(1)', q: '在PHP中用于输出字符串"Hello, World!"的语句是______。', answer: 'echo "Hello,World"' },
  { id: 48, type: 'fill',  chapter: '第3章(1)', q: '在PHP中，要比较两个字符串是否相等，应使用______运算符。', answer: '==' },
  { id: 49, type: 'fill',  chapter: '第3章(1)', q: '要在PHP中包含一个名为"conn.php"的文件，应使用______语句。', answer: "include 'conn.php';" },
  { id: 50, type: 'judge', chapter: '第3章(1)', q: '若某页面上包含动画内容，则该页面肯定是动态页面。', answer: '错' },
  { id: 51, type: 'judge', chapter: '第3章(1)', q: '一个网站中可以同时包含静态页面和动态页面。', answer: '对' },
  { id: 52, type: 'judge', chapter: '第3章(1)', q: '.html文件不需要编译，直接从Web服务器下载到浏览器执行即可。', answer: '对' },
  { id: 53, type: 'judge', chapter: '第3章(1)', q: '所谓响应式设计，就是使设计的页面能根据用户终端设备尺寸或浏览器窗口尺寸来自动进行布局调整。', answer: '对' },
  { id: 54, type: 'judge', chapter: '第3章(1)', q: 'Dreamweaver不允许用户为一个站点定义多个服务器。', answer: '错' },
  { id: 55, type: 'judge', chapter: '第3章(1)', q: 'PHP中的变量名必须以$符号开头。', answer: '对' },

  // ===== 第3章(2) =====
  { id: 56, type: 'single', chapter: '第3章(2)', q: '在电子商务网站开发中，以下哪个工具主要用于前端页面设计？', options: ['Visual Studio', 'Dreamweaver', 'phpstudy', 'MySQL'], answer: 'B' },
  { id: 57, type: 'single', chapter: '第3章(2)', q: '在网站开发中，以下哪种数据库管理系统常用于存储动态数据？', options: ['Microsoft Word', 'MySQL', 'Adobe Photoshop', 'Excel'], answer: 'B' },
  { id: 58, type: 'single', chapter: '第3章(2)', q: '在网页发布过程中，以下哪个步骤是将网站文件上传到服务器上的？', options: ['编写代码', '测试网站', '上传文件', '设计界面'], answer: 'C' },
  { id: 59, type: 'single', chapter: '第3章(2)', q: '在网页更新时，为了不影响用户体验，应该采取哪种策略？', options: ['一次性全部更新', '分批次逐步更新', '只更新部分内容', '不更新'], answer: 'B' },
  { id: 60, type: 'single', chapter: '第3章(2)', q: '在网页更新时，为了保证网站的稳定性，应该优先更新哪个部分？', options: ['首页', '后台管理', '用户界面', '广告模块'], answer: 'B' },
  { id: 61, type: 'single', chapter: '第3章(2)', q: '以下哪种方式不是常见的网页更新方法？', options: ['手动上传', '自动部署', '邮件发送', '版本控制系统'], answer: 'C' },
  { id: 62, type: 'single', chapter: '第3章(2)', q: '在网页发布过程中，以下哪项操作不是必要的？', options: ['编写代码', '测试网页', '购买域名', '上传文件'], answer: 'C' },
  { id: 63, type: 'single', chapter: '第3章(2)', q: '在电子商务网站设计中，以下哪个技术主要用于提高用户体验？', options: ['SEO优化', '数据库优化', '响应式网页设计', '服务器负载均衡'], answer: 'C' },
  { id: 64, type: 'single', chapter: '第3章(2)', q: '在电子商务网站中，用于处理用户登录验证的主要技术是？', options: ['HTML', 'CSS', 'JavaScript', 'PHP'], answer: 'D' },
  { id: 65, type: 'single', chapter: '第3章(2)', q: '在移动设备网页开发中，用于检测用户触摸事件的JavaScript方法是？', options: ['click()', 'touchstart()', 'mouseover()', 'mousedown()'], answer: 'B' },
  { id: 66, type: 'single', chapter: '第3章(2)', q: '在移动设备网页开发中，用于检测用户滚动事件的JavaScript方法是？', options: ['scroll()', 'touchmove()', 'resize()', 'keydown()'], answer: 'A' },
  { id: 67, type: 'single', chapter: '第3章(2)', q: '在电子商务网站设计中，以下哪个因素不是影响用户体验的关键因素？', options: ['页面加载速度', '网站的颜色搭配', '商品的价格', '导航的清晰度'], answer: 'C' },
  { id: 68, type: 'single', chapter: '第3章(2)', q: '在电子商务网站中，以下哪种方式不是常用的用户反馈渠道？', options: ['在线客服', '电子邮件', '电话热线', '社交媒体广告'], answer: 'D' },
  { id: 69, type: 'multi', chapter: '第3章(2)', q: '在电子商务网站开发中，以下哪些技术是用于后端开发的？', options: ['HTML', 'JavaScript', 'PHP', 'Python', 'ASP.NET'], answer: 'CDE' },
  { id: 70, type: 'multi', chapter: '第3章(2)', q: '在进行网页更新时，需要考虑哪些因素以确保用户体验？', options: ['页面加载速度', '颜色搭配', '内容相关性', '导航清晰度', '字体大小'], answer: 'ABCDE' },
  { id: 71, type: 'multi', chapter: '第3章(2)', q: '在网页发布过程中，以下哪些因素会影响网页加载速度？', options: ['图片大小', '服务器带宽', '用户地理位置', '字体颜色'], answer: 'ABC' },
  { id: 72, type: 'multi', chapter: '第3章(2)', q: '以下哪些技术可以用来优化移动设备上的网页加载速度？', options: ['压缩图片', '使用CDN服务', '减少HTTP请求', '增加页面元素', '使用WebP格式图片'], answer: 'ABCE' },
  { id: 73, type: 'multi', chapter: '第3章(2)', q: '在移动设备上，为了提升用户体验，可以采取哪些措施？', options: ['简化页面布局', '增加页面元素', '优化字体大小', '使用高分辨率图片', '减少页面跳转'], answer: 'ACE' },
  { id: 74, type: 'multi', chapter: '第3章(2)', q: '在移动设备网页设计中，为了提高用户体验，可以采取以下哪些措施？', options: ['简化导航结构', '增加页面加载时间', '优化字体大小和颜色对比度', '使用大按钮和链接', '减少页面元素'], answer: 'ACDE' },
  { id: 75, type: 'multi', chapter: '第3章(2)', q: '在移动设备网页设计中，为了提高页面的可访问性，可以采取以下哪些措施？', options: ['提供语音输入功能', '使用高对比度的颜色方案', '增加页面加载时间', '提供文字描述', '使用大字体'], answer: 'ABDE' },
  { id: 76, type: 'multi', chapter: '第3章(2)', q: '在电子商务网站中，以下哪些方法可以有效提高转化率？', options: ['提供多种支付方式', '简化购物流程', '增加商品种类', '优化搜索功能'], answer: 'ABD' },
  { id: 77, type: 'fill',  chapter: '第3章(2)', q: '在网站开发中，______用于定义网页的结构，______用于定义网页的样式，而______用于定义网页的行为。', answer: 'HTML/CSS/JavaScript' },
  { id: 78, type: 'fill',  chapter: '第3章(2)', q: '在网页发布前，通常需要进行______，以确保网站的功能正常运行。', answer: '测试' },
  { id: 79, type: 'fill',  chapter: '第3章(2)', q: '在移动设备网页设计中，为了使网页在不同屏幕尺寸下都能良好显示，通常会使用______技术。', answer: '响应式网页设计' },
  { id: 80, type: 'judge', chapter: '第3章(2)', q: 'FTP协议主要用于网页发布过程中的文件传输。', answer: '对' },
  { id: 81, type: 'judge', chapter: '第3章(2)', q: '网页更新时，只需要更新内容，无需考虑页面布局。', answer: '错' },
  { id: 82, type: 'judge', chapter: '第3章(2)', q: '网页更新时，只需要更新HTML文件即可，无需考虑CSS和JavaScript文件。', answer: '错' },
  { id: 83, type: 'judge', chapter: '第3章(2)', q: '在电子商务网站中，使用HTTPS协议可以增强数据传输的安全性。', answer: '对' },
  { id: 84, type: 'judge', chapter: '第3章(2)', q: '在电子商务网站中，使用CDN（内容分发网络）可以加速静态资源的加载。', answer: '对' },
  { id: 85, type: 'judge', chapter: '第3章(2)', q: '在移动设备网页设计中，使用固定宽度布局可以保证网页在不同设备上的显示效果一致。', answer: '错' },
  { id: 86, type: 'judge', chapter: '第3章(2)', q: '在电子商务网站中，SEO优化对于提高网站流量至关重要。', answer: '对' },
  { id: 87, type: 'judge', chapter: '第3章(2)', q: '在电子商务网站中，响应式设计能够确保网站在不同设备上的良好展示。', answer: '对' },

  // ===== 第4章(1) =====
  { id: 88, type: 'single', chapter: '第4章(1)', q: '以下选项中描述数据库表结构的文件扩展名是', options: ['.frm', '.myd', '.myi', '.sql'], answer: 'A' },
  { id: 89, type: 'single', chapter: '第4章(1)', q: '视图在数据库中的主要作用是', options: ['存储数据', '安全机制', '执行计算', '物理存储'], answer: 'B' },
  { id: 90, type: 'single', chapter: '第4章(1)', q: '索引的主要目的是', options: ['保证数据的完整性', '节省存储空间', '限制数据访问', '提高查询速度'], answer: 'D' },
  { id: 91, type: 'single', chapter: '第4章(1)', q: '存储过程与函数之间的主要区别是', options: ['函数可以返回多个结果集，而存储过程只能返回一个', '存储过程不能带有参数，而函数可以', '存储过程可以返回多个结果集，而函数只能返回一个', '存储过程可以修改数据，而函数则不能'], answer: 'C' },
  { id: 92, type: 'single', chapter: '第4章(1)', q: '触发器通常用于', options: ['执行复杂的业务逻辑', '自动执行数据操作之后的代码', '进行数据定义', '替代存储过程'], answer: 'B' },
  { id: 93, type: 'single', chapter: '第4章(1)', q: '在数据库中，用户和角色的关系是', options: ['用户就是角色', '角色是用户的集合', '用户拥有角色', '角色继承自用户'], answer: 'C' },
  { id: 94, type: 'single', chapter: '第4章(1)', q: '用于加速查询性能的数据库对象是', options: ['触发器', '索引', '视图', '存储过程'], answer: 'B' },
  { id: 95, type: 'single', chapter: '第4章(1)', q: '在SQL中，用于执行预定义SQL语句或批处理的数据库对象是', options: ['触发器', '视图', '索引', '存储过程'], answer: 'D' },
  { id: 96, type: 'single', chapter: '第4章(1)', q: '在数据库管理系统中，用于在指定事件发生时自动执行或激活的数据库对象是', options: ['触发器', '角色', '用户定义函数', '存储过程'], answer: 'A' },
  { id: 97, type: 'single', chapter: '第4章(1)', q: '在SQL中，用于管理数据库用户权限的数据库对象是', options: ['触发器', '角色', '索引', '视图'], answer: 'B' },
  { id: 98, type: 'single', chapter: '第4章(1)', q: '允许你根据一个或多个表的数据创建一个虚拟表的数据库对象是', options: ['触发器', '存储过程', '索引', '视图'], answer: 'D' },
  { id: 99, type: 'single', chapter: '第4章(1)', q: 'SQL中用于创建新表的命令是', options: ['CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'SELECT'], answer: 'A' },
  { id: 100, type: 'single', chapter: '第4章(1)', q: 'SQL中用于从数据库中删除一个表的命令是', options: ['REMOVE TABLE', 'RENAME TABLE', 'DROP TABLE', 'CLEAR TABLE'], answer: 'C' },
  { id: 101, type: 'single', chapter: '第4章(1)', q: 'SQL中用于更新现有记录的命令是', options: ['REPLACE', 'RENEW', 'MODIFY', 'UPDATE'], answer: 'D' },
  { id: 102, type: 'single', chapter: '第4章(1)', q: 'SQL中用于限制查询结果数量的关键字是', options: ['TOP', 'FIRST', 'COUNT', 'LIMIT'], answer: 'D' },
  { id: 103, type: 'single', chapter: '第4章(1)', q: '用于计算表中记录数的SQL函数是', options: ['SUM()', 'COUNT()', 'AVG()', 'MAX()'], answer: 'B' },
  { id: 104, type: 'single', chapter: '第4章(1)', q: '在MySQL中，用于在查询中排序结果的关键字是', options: ['ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT'], answer: 'A' },
  { id: 105, type: 'single', chapter: '第4章(1)', q: '用于删除表中的记录但不删除表本身的SQL语句是', options: ['DROP TABLE', 'REMOVE', 'TRUNCATE TABLE', 'DELETE FROM'], answer: 'D' },
  { id: 106, type: 'multi', chapter: '第4章(1)', q: '下列选项中属于MySQL系统数据库的是', options: ['sys数据库', 'mysql数据库', 'test数据库', 'information_schema数据库'], answer: 'ABD' },
  { id: 107, type: 'judge', chapter: '第4章(1)', q: '在MySQL中，VARCHAR(255)数据类型用于存储可变长度的字符串，最大长度为255个字符。', answer: '对' },
  { id: 108, type: 'judge', chapter: '第4章(1)', q: 'MySQL中的INT数据类型是一个固定大小的整数，占用4个字节。', answer: '对' },
  { id: 109, type: 'judge', chapter: '第4章(1)', q: 'CREATE DATABASE语句用于创建新的数据库，如果数据库已存在，则不会报错，除非使用了IF NOT EXISTS子句。', answer: '错' },
  { id: 110, type: 'judge', chapter: '第4章(1)', q: '使用ALTER TABLE可以修改表结构，包括添加、删除列或更改列的数据类型。', answer: '对' },
  { id: 111, type: 'judge', chapter: '第4章(1)', q: '使用INSERT INTO table_name (column1, column2) VALUES (value1, value2);语句可以向表中插入新行。', answer: '对' },

  // ===== 第4章(2) =====
  { id: 112, type: 'single', chapter: '第4章(2)', q: '在SQL语言中，用于创建数据库对象（如表、视图等）的语句属于哪一类？', options: ['数据描述语言（DDL）', '数据查询语言（DQL）', '数据操纵语言（DML）', '数据控制语言（DCL）'], answer: 'A' },
  { id: 113, type: 'single', chapter: '第4章(2)', q: '在SQL中，用于控制对数据库的访问权限的语句属于哪一类？', options: ['数据描述语言（DDL）', '数据查询语言（DQL）', '数据操纵语言（DML）', '数据控制语言（DCL）'], answer: 'D' },
  { id: 114, type: 'single', chapter: '第4章(2)', q: '在SQL查询语句中，用于限制查询结果集的子句是哪个？', options: ['FROM', 'WHERE', 'GROUP BY', 'ORDER BY'], answer: 'B' },
  { id: 115, type: 'single', chapter: '第4章(2)', q: 'SQL语言中，用于查询数据的语句是？', options: ['CREATE', 'SELECT', 'UPDATE', 'DELETE'], answer: 'B' },
  { id: 116, type: 'single', chapter: '第4章(2)', q: '在SQL中，用于修改表结构的关键字是？', options: ['ALTER TABLE', 'CREATE TABLE', 'DROP TABLE', 'TRUNCATE TABLE'], answer: 'A' },
  { id: 117, type: 'single', chapter: '第4章(2)', q: '要为员工表添加入职日期字段，数据类型应选择：', options: ['VARCHAR(20)', 'INT', 'DATETIME', 'BLOB'], answer: 'C' },
  { id: 118, type: 'single', chapter: '第4章(2)', q: '需要统计每个分类下的商品数量，应该使用：', options: ['COUNT()配合WHERE', 'SUM()配合HAVING', 'COUNT()配合GROUP BY', 'MAX()配合ORDER BY'], answer: 'C' },
  { id: 119, type: 'single', chapter: '第4章(2)', q: '查询订单表时希望按订单金额降序排列，正确的子句是：', options: ['ORDER BY amount ASC', 'GROUP BY amount DESC', 'ORDER BY amount DESC', 'SORT BY amount'], answer: 'C' },
  { id: 120, type: 'multi', chapter: '第4章(2)', q: '下列哪些SQL语句属于数据操纵语言（DML）？', options: ['CREATE', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'GRANT'], answer: 'BCDE' },
  { id: 121, type: 'multi', chapter: '第4章(2)', q: '以下哪些是SQL语言的主要功能？', options: ['数据描述', '数据查询', '数据操纵', '数据控制', '数据加密'], answer: 'ABCD' },
  { id: 122, type: 'multi', chapter: '第4章(2)', q: '在SQL的SELECT语句中，哪些子句可以用来过滤数据？', options: ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'], answer: 'BD' },
  { id: 123, type: 'multi', chapter: '第4章(2)', q: '在SQL查询中，哪些关键字可以用于限制返回的记录数量？', options: ['LIMIT', 'TOP', 'WHERE', 'ORDER BY'], answer: 'AB' },
  { id: 124, type: 'multi', chapter: '第4章(2)', q: '关于SELECT语句的正确用法包括：', options: ['SELECT * FROM products', 'SELECT WHERE price > 100', 'SELECT product_name, price FROM products', 'SELECT * INSERT INTO new_table'], answer: 'AC' },
  { id: 125, type: 'multi', chapter: '第4章(2)', q: '数据库设计时需要考虑：', options: ['字段数据类型选择', '表之间的关联关系', '前端页面配色方案', '数据冗余控制'], answer: 'ABD' },
  { id: 126, type: 'judge', chapter: '第4章(2)', q: '使用DROP TABLE语句可以永久删除数据库中的表及其数据。', answer: '对' },
  { id: 127, type: 'judge', chapter: '第4章(2)', q: '在MySQL中，修改表结构的操作应该使用ALTER DATABASE语句。', answer: '错' },
  { id: 128, type: 'judge', chapter: '第4章(2)', q: 'WHERE子句可以在GROUP BY之后使用进行条件筛选。', answer: '错' },
  { id: 129, type: 'judge', chapter: '第4章(2)', q: '使用LIKE \'_a%\'可以匹配第二个字符为a的字符串。', answer: '对' },
  { id: 130, type: 'judge', chapter: '第4章(2)', q: '在MySQL中，DROP TABLE语句会同时删除表结构和表中的数据。', answer: '对' },
  { id: 131, type: 'judge', chapter: '第4章(2)', q: '在MySQL中，存储过程可以直接返回结果集。', answer: '对' },

  // ===== 第5章 =====
  { id: 132, type: 'single', chapter: '第5章', q: '电子商务网站管理的核心目的是', options: ['提升用户体验和网站性能', '提高网站访问量', '降低运营成本', '扩大品牌知名度'], answer: 'A' },
  { id: 133, type: 'single', chapter: '第5章', q: '在电子商务网站管理中，对于网站的安全性至关重要的因素是', options: ['服务器性能', '网络安全防护', '网页设计', '数据库结构'], answer: 'B' },
  { id: 134, type: 'single', chapter: '第5章', q: '电子商务网站为保证其正常运行需要定期进行的操作是', options: ['数据分析', '广告投放', '备份和恢复', '内容更新'], answer: 'C' },
  { id: 135, type: 'single', chapter: '第5章', q: '在网站管理中，分析用户行为的重要工具是', options: ['日志文件', '社交媒体', '搜索引擎', '电子邮件'], answer: 'A' },
  { id: 136, type: 'single', chapter: '第5章', q: '在网站管理中，网站架构指的是', options: ['网站的设计风格', '网站的页面布局', '网站的服务器配置', '网站的组织结构和功能设计'], answer: 'D' },
  { id: 137, type: 'single', chapter: '第5章', q: '在电子商务网站管理中，哪一项不属于网站的系统管理？', options: ['服务器配置', '用户界面设计', '数据库优化', '网络安全设置'], answer: 'B' },
  { id: 138, type: 'single', chapter: '第5章', q: '在电子商务网站管理中，哪一项不是环境管理的内容？', options: ['网络设备维护', '员工培训', '机房环境监控', '网络带宽管理'], answer: 'B' },
  { id: 139, type: 'single', chapter: '第5章', q: '在电子商务网站的规划管理中，哪一项不是其主要内容？', options: ['网站整体运营规划', '网站风格设计', '网站主体框架结构设计', '网站代码编写'], answer: 'D' },
  { id: 140, type: 'single', chapter: '第5章', q: '上图描述的数据备份方式是', options: ['异地备份', '灾难恢复备份', '实时备份', '镜像备份'], answer: 'C' },
  { id: 141, type: 'multi', chapter: '第5章', q: '电子商务网站的数据管理包括哪些方面？', options: ['数据收集', '数据分析', '数据存储', '客户服务'], answer: 'ABC' },
  { id: 142, type: 'multi', chapter: '第5章', q: '电子商务网站的数据管理主要包括哪些方面？', options: ['数据备份与恢复', '用户界面优化', '数据加密与安全', '服务器性能监控'], answer: 'AC' },
  { id: 143, type: 'multi', chapter: '第5章', q: '电子商务网站的环境管理主要包括哪些方面？', options: ['物理环境管理', '虚拟环境管理', '人员管理', '数据管理', '系统管理'], answer: 'AB' },
  { id: 144, type: 'fill',  chapter: '第5章', q: '电子商务网站的管理包括人员管理、______管理、______管理、______管理、______管理、______管理和______管理。', answer: '系统/数据/设备/环境/规划/运营' },
  { id: 145, type: 'fill',  chapter: '第5章', q: '在电子商务网站环境管理中，门禁系统的作用是限制______人员的进入。', answer: '非授权' },
  { id: 146, type: 'fill',  chapter: '第5章', q: '动力供配电系统是确保电子商务网站______的重要基础设施。', answer: '稳定运行' },
  { id: 147, type: 'judge', chapter: '第5章', q: '描述"用户可在指定目录下创建目录、创建文件，并往文件中写入新的内容，但不能运行该目录下的文件，不能对该文件进行修改"的权限是写入。', answer: '对' },
  { id: 148, type: 'judge', chapter: '第5章', q: '描述"只能列出指定的文件或目录，以及子目录，但不能对文件实现包括运行在内的任何处理，同时不能对目录进行任何操作"的权限是写入。', answer: '错' },
  { id: 149, type: 'judge', chapter: '第5章', q: '对计算机及网络设备使用的机械工具，包括镊子、改锥、夹线钳等属于检测工具。', answer: '错' },
  { id: 150, type: 'judge', chapter: '第5章', q: '在人员管理中，不需要考虑计算机操作人员的技能水平。', answer: '错' },
  { id: 151, type: 'judge', chapter: '第5章', q: '数据分类是为了方便数据的存储，与数据的安全性无关。', answer: '错' },
  { id: 152, type: 'judge', chapter: '第5章', q: '电子商务网站设备管理流程中，不包括设备的采购。', answer: '错' },
  { id: 153, type: 'judge', chapter: '第5章', q: '静电与灾害防范是电子商务网站环境管理中可有可无的部分。', answer: '错' },
  { id: 154, type: 'judge', chapter: '第5章', q: '电子商务网站的数据管理主要是指对用户数据的收集和分析。', answer: '错' },
  { id: 155, type: 'judge', chapter: '第5章', q: '电子商务网站的人员管理主要是指对网站开发人员的管理。', answer: '错' },
  { id: 156, type: 'judge', chapter: '第5章', q: '电子商务网站的数据管理主要关注数据的安全性和完整性。', answer: '对' },

  // ===== 第6章 =====
  { id: 157, type: 'single', chapter: '第6章', q: 'SSL协议主要用于保障哪种类型的通信安全？', options: ['电子邮件', '网页浏览', '文件传输', '即时通讯'], answer: 'B' },
  { id: 158, type: 'single', chapter: '第6章', q: '下列哪一项不是电子支付的特征？', options: ['基于开放的系统平台', '使用先进的网络通信手段', '支付过程复杂繁琐', '具有高效、经济的优势'], answer: 'C' },
  { id: 159, type: 'single', chapter: '第6章', q: '电子支付协议中，用于加密数据传输的是哪个协议？', options: ['HTTP协议', 'FTP协议', 'SSL协议', 'SMTP协议'], answer: 'C' },
  { id: 160, type: 'single', chapter: '第6章', q: '在电子商务支付中，不需要通过第三方支付平台的支付方式是', options: ['网上银行转账', '支付宝', '微信支付', '银联在线支付'], answer: 'A' },
  { id: 161, type: 'single', chapter: '第6章', q: '以下在跨境电子商务中最常用的支付方式是', options: ['货到付款', '信用卡支付', '虚拟货币支付', '借记卡支付'], answer: 'B' },
  { id: 162, type: 'single', chapter: '第6章', q: '第三方支付平台确保交易双方权益的方式是', options: ['替交易双方保存货物', '替交易双方购买保险', '替交易双方保管资金', '替交易双方协商价格'], answer: 'C' },
  { id: 163, type: 'single', chapter: '第6章', q: '在电子商务支付中，通常用于保证交易安全的技术是', options: ['蓝牙技术', 'NFC技术', '云计算技术', 'SSL加密技术'], answer: 'D' },
  { id: 164, type: 'single', chapter: '第6章', q: '在进行在线支付时，如果银行卡信息泄露，以下最不安全的做法是', options: ['立即联系银行冻结账户', '更改支付密码', '继续使用该银行卡进行支付', '报警处理'], answer: 'C' },
  { id: 165, type: 'single', chapter: '第6章', q: '信用卡在线支付时，通常不需要提供的信息是', options: ['身份证号', '卡号', '密码', '信用卡有效期'], answer: 'A' },
  { id: 166, type: 'single', chapter: '第6章', q: '网银的安全机制不包括', options: ['数字证书', '动态口令验证', '手机验证码', '有效期'], answer: 'D' },
  { id: 167, type: 'single', chapter: '第6章', q: '下列不属于第三方支付的特征是', options: ['完全与交易双方和银行相独立，具有独立性', '可以整合多种银行支付，具有便捷性', '可以提高交易双方信用水平', '整合多种支付渠道，能根据商户需求进行个性化定制'], answer: 'D' },
  { id: 168, type: 'single', chapter: '第6章', q: '下列不属于第三方支付的主要支付平台是', options: ['支付宝', '聚合支付', '银联支付', '云闪付'], answer: 'B' },
  { id: 169, type: 'multi', chapter: '第6章', q: '电子支付的主要特征有哪些？', options: ['采用先进的技术通过数字流转来完成信息的传输', '支付的工作环境基于封闭的系统平台', '使用先进的网络通信手段，对软硬件设施的要求很高', '具有方便、快捷、高效、经济的优势'], answer: 'ACD' },
  { id: 170, type: 'multi', chapter: '第6章', q: '电子支付协议包括哪些？', options: ['SSL协议', 'HTTP协议', 'SET协议', 'FTP协议'], answer: 'AC' },
  { id: 171, type: 'multi', chapter: '第6章', q: '电子支付的业务类型有哪些？', options: ['网上支付', '电话支付', '移动支付', '邮政汇款'], answer: 'ABC' },
  { id: 172, type: 'multi', chapter: '第6章', q: '电子支付的发展阶段包括哪些？', options: ['银行利用计算机处理银行之间的业务，办理结算', '银行计算机与其他机构计算机之间资金的结算', '利用网络终端向客户提供各项银行服务', '基于互联网的电子支付，实现随时随地通过互联网进行直接转账结算'], answer: 'ABCD' },
  { id: 173, type: 'fill',  chapter: '第6章', q: '电子支付协议中，用于保障交易安全的是______协议。', answer: 'SET' },
  { id: 174, type: 'fill',  chapter: '第6章', q: '电子商务支付的安全性主要通过______技术和数据加密技术来保障。', answer: '身份认证' },
  { id: 175, type: 'fill',  chapter: '第6章', q: '微信支付支持绑定多种银行卡，包括借记卡和______卡。', answer: '信用' },
  { id: 176, type: 'judge', chapter: '第6章', q: '电子支付必须通过银行系统完成资金划转。', answer: '错' },
  { id: 177, type: 'judge', chapter: '第6章', q: '跨境电子商务支付通常涉及汇率转换和跨境结算等问题。', answer: '对' },
  { id: 178, type: 'judge', chapter: '第6章', q: '用户在电子商务平台完成支付后，交易即告完成。', answer: '错' },
  { id: 179, type: 'judge', chapter: '第6章', q: '第三方支付平台在电子商务中起到资金托管和清算的作用。', answer: '对' },
  { id: 180, type: 'judge', chapter: '第6章', q: '进行电子商务支付时，用户应在公共Wi-Fi环境下进行支付以节省费用。', answer: '错' },
  { id: 181, type: 'judge', chapter: '第6章', q: '信用卡支付在电子商务中需要输入卡号、密码和有效期等信息。', answer: '对' },

  // ===== 第7章 =====
  { id: 182, type: 'single', chapter: '第7章', q: '下列哪一项不是电子商务网站推广的主要目的？', options: ['提高网站访问量', '减少网站维护成本', '增加商业机会', '提升品牌知名度'], answer: 'B' },
  { id: 183, type: 'single', chapter: '第7章', q: '以下哪种方式不属于电子商务网站的传统推广方式？', options: ['广播广告', '电视广告', '社交媒体推广', '报纸广告'], answer: 'C' },
  { id: 184, type: 'single', chapter: '第7章', q: '在网站推广中，"转化率"指的是', options: ['用户访问网站的比率', '用户完成购买的比率', '用户注册网站的比率', '用户访问网站的频率'], answer: 'B' },
  { id: 185, type: 'single', chapter: '第7章', q: '在电子商务网站推广中，"跳出率"指的是', options: ['用户购买商品的比率', '用户离开网站的比率', '用户访问网站的比率', '用户注册网站的比率'], answer: 'B' },
  { id: 186, type: 'single', chapter: '第7章', q: '搜索引擎优化（SEO）的主要目的是', options: ['增加网站在搜索引擎中的可见性', '提高产品质量', '减少网站成本', '加快网站加载速度'], answer: 'A' },
  { id: 187, type: 'single', chapter: '第7章', q: '在网站内容优化中，对搜索引擎排名最重要的元素是', options: ['网站颜色搭配', '网站布局', '广告数量', '关键词密度'], answer: 'D' },
  { id: 188, type: 'single', chapter: '第7章', q: '在网站推广中，可以衡量广告效果的指标是', options: ['库存周转率', '退货率', '点击率CTR', '客户满意度'], answer: 'C' },
  { id: 189, type: 'single', chapter: '第7章', q: '在网站设计中，对于提高转化率最重要的元素是', options: ['背景音乐', '丰富的动画效果', '清晰的购买流程', '精美的动画效果'], answer: 'C' },
  { id: 190, type: 'single', chapter: '第7章', q: '在网站推广中，可以衡量广告投资回报率的指标是', options: ['转化率', '点击率', '曝光率', '广告费用'], answer: 'A' },
  { id: 191, type: 'single', chapter: '第7章', q: '企业形象识别系统CIS的核心是', options: ['理念识别MI', '行为识别BI', '听觉识别HI', '视觉识别VI'], answer: 'D' },
  { id: 192, type: 'single', chapter: '第7章', q: '在电子商务网站推广中，选择关键词时，最重要的因素是', options: ['关键词的搜索量', '关键词与产品的相关度', '关键词的拼写难度', '关键词的字母长度'], answer: 'B' },
  { id: 193, type: 'multi', chapter: '第7章', q: '以下哪些是电子商务网站推广的有效手段？', options: ['登录搜索引擎', '广播广告', '电视广告', '社交媒体推广', '电子邮件群发'], answer: 'ABCDE' },
  { id: 194, type: 'multi', chapter: '第7章', q: '在进行电子商务网站推广时，需要注意哪些关键点？', options: ['选取恰当的关键词', '确保排名靠前', '提高网站维护成本', '把握发送频率', '认真编写邮件内容'], answer: 'ABDE' },
  { id: 195, type: 'judge', chapter: '第7章', q: '登录搜索引擎是电子商务网站推广的重要手段之一。', answer: '对' },
  { id: 196, type: 'judge', chapter: '第7章', q: '电子邮件群发推广是一种被动式的网络营销方式。', answer: '错' },
  { id: 197, type: 'judge', chapter: '第7章', q: '电子商务网站推广只需要关注搜索引擎优化（SEO），其他推广方式不重要。', answer: '错' },
  { id: 198, type: 'judge', chapter: '第7章', q: '关键词密度越高，网站在搜索引擎中的排名就越高。', answer: '错' },
  { id: 199, type: 'judge', chapter: '第7章', q: '电子商务网站的转化率只与产品价格和促销活动有关。', answer: '错' },
  { id: 200, type: 'judge', chapter: '第7章', q: '为了提高网站的加载速度，应该尽可能减少图片的使用。', answer: '错' },
  { id: 201, type: 'fill',  chapter: '第7章', q: '电子商务网站推广中，SEO的核心目标是提高网站在搜索引擎结果页面中的______。', answer: '排名' },
  { id: 202, type: 'fill',  chapter: '第7章', q: '为了提高网站的访问速度，优化______是一个有效的策略。', answer: '图片' },
  { id: 203, type: 'fill',  chapter: '第7章', q: '在电子商务网站的SEO中，为了提高搜索排名，网站管理员应该针对目标用户群体进行分析，以确定最适合网站的______。', answer: '关键词' },
];

const TIME_LIMIT = 1200; // 20分钟
const LABEL = 'ABCDEFGH';

/* ================================================================
   Helpers
   ================================================================ */

function getChapters(qs: QItem[]): string[] {
  const seen: Record<string, boolean> = {};
  for (const q of qs) seen[q.chapter] = true;
  return Object.keys(seen);
}

/* ================================================================
   Component
   ================================================================ */

export default function WebQuiz() {
  const [answers, setA] = useState<Record<number, string>>({});
  const [multiSel, setM] = useState<Record<number, string[]>>({});
  const [fills, setF] = useState<Record<number, string>>({});
  const [submitted, setSub] = useState(false);
  const [timeLeft, setT] = useState(TIME_LIMIT);
  const [started, setStart] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!started || submitted) return;
    timer.current = setInterval(() => {
      setT((t) => { if (t <= 1) { clearInterval(timer.current!); setSub(true); return 0; } return t - 1; });
    }, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [started, submitted]);

  const pick = (id: number, val: string) => { if (!submitted) setA((p) => ({ ...p, [id]: val })); };
  const toggle = (id: number, opt: string) => {
    if (submitted) return;
    setM((p) => { const cur = p[id] || []; return cur.includes(opt) ? { ...p, [id]: cur.filter((x) => x !== opt) } : { ...p, [id]: [...cur, opt] }; });
  };
  const setFill = (id: number, val: string) => { if (!submitted) setF((p) => ({ ...p, [id]: val })); };

  const score = useCallback(() => {
    let n = 0;
    for (const q of QS) {
      if (q.type === 'single') { if (answers[q.id] === q.answer) n++; }
      else if (q.type === 'multi') {
        const sel = (multiSel[q.id] || []).map((t: string) => { const i = q.options!.indexOf(t); return i >= 0 ? LABEL[i] : ''; }).sort().join('');
        if (sel === q.answer) n++;
      }
      else if (q.type === 'judge') { if (answers[q.id] === q.answer) n++; }
      else if (q.type === 'fill') {
        const ua = (fills[q.id] || '').trim().replace(/\s+/g, '');
        const aa = q.answer.replace(/\s+/g, '');
        if (ua === aa || aa.includes(ua) || (ua.length > 0 && aa.startsWith(ua))) n++;
      }
    }
    return n;
  }, [answers, multiSel, fills]);

  const handleSubmit = () => { setSub(true); if (timer.current) clearInterval(timer.current); };

  const ua = (q: QItem): string => {
    if (q.type === 'single' || q.type === 'judge') return answers[q.id] || '';
    if (q.type === 'multi') return (multiSel[q.id] || []).map((t: string) => { const i = q.options!.indexOf(t); return i >= 0 ? LABEL[i] : ''; }).sort().join('');
    return fills[q.id] || '';
  };
  const wrong = (q: QItem) => submitted && ua(q) !== '' && ua(q) !== q.answer;

  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  const timedOut = started && timeLeft === 0 && !submitted;
  const chapters = getChapters(QS);
  const [activeChapter, setActiveChapter] = useState(chapters[0]);

  if (!started) {
    return (
      <div style={{ width: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', padding: '40px 48px', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>网站建设小测</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>共 {QS.length} 题 · 限时 {TIME_LIMIT / 60} 分钟</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>单选 + 多选 + 判断 + 填空 · 时间到自动提交</div>
          <button onClick={() => setStart(true)} style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>开始答题</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 820, margin: '0 auto', fontFamily: "'Inter','PingFang SC','Microsoft YaHei',sans-serif" }}>
      {/* Timer bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderRadius: '0 0 12px 12px', marginBottom: 16, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>⏱</span>
        <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: timeLeft <= 30 ? '#ef4444' : timeLeft <= 60 ? '#f59e0b' : '#1e293b' }}>{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{QS.length}题</span>
        {!submitted ? (
          <button onClick={handleSubmit} style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 6, border: '1px solid #6366f1', background: '#fff', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>提交答卷</button>
        ) : (
          <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: '#6366f1', background: 'rgba(99,102,241,0.08)', padding: '6px 14px', borderRadius: 8 }}>得分 {score()} / {QS.length}</span>
        )}
      </div>

      {/* Result */}
      {submitted && (
        <div style={{ padding: '16px 20px', borderRadius: 10, marginBottom: 20, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{score()} / {QS.length}</div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
            {(() => { const p = score() / QS.length; if (p >= 0.9) return '🏆 优秀！'; if (p >= 0.7) return '👍 良好！'; if (p >= 0.6) return '📖 及格'; return '💪 继续加油！'; })()}
            {timedOut && '（时间到，自动提交）'}
          </div>
        </div>
      )}

      {/* Chapter nav */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {chapters.map((ch) => (
          <button key={ch} onClick={() => setActiveChapter(ch)} style={{
            padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            background: activeChapter === ch ? '#6366f1' : '#f1f5f9',
            color: activeChapter === ch ? '#fff' : '#64748b',
          }}>{ch}</button>
        ))}
      </div>

      {/* Questions */}
      {QS.filter((q) => q.chapter === activeChapter).map((q) => {
        const idx = QS.indexOf(q);
        const w = wrong(q);
        const c = submitted && !w && ua(q) !== '';

        return (
          <div key={q.id} style={{
            padding: '16px 20px', borderRadius: 10, marginBottom: 12,
            border: `1.5px solid ${w ? '#fca5a5' : c ? '#86efac' : '#e2e8f0'}`,
            background: w ? '#fef2f2' : c ? '#f0fdf4' : '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 6, background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                background: q.type === 'multi' ? '#fef3c7' : q.type === 'fill' ? '#dbeafe' : q.type === 'judge' ? '#e0f2fe' : '#e0e7ff',
                color: q.type === 'multi' ? '#d97706' : q.type === 'fill' ? '#2563eb' : q.type === 'judge' ? '#0284c7' : '#4338ca',
              }}>{q.type === 'multi' ? '多选' : q.type === 'fill' ? '填空' : q.type === 'judge' ? '判断' : '单选'}</span>
            </div>

            <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.6, fontWeight: 500 }}>{q.q}</div>

            {/* Options for single/multi */}
            {q.options && (q.type === 'single' || q.type === 'multi') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                {q.options.map((opt, oi) => {
                  const letter = LABEL[oi];
                  const sel = q.type === 'single' ? answers[q.id] === letter : (multiSel[q.id] || []).includes(opt);
                  const isAns = q.answer.includes(letter);
                  const showC = submitted && w && isAns;
                  const showW = submitted && w && sel && !isAns;
                  return (
                    <div key={oi} onClick={() => q.type === 'single' ? pick(q.id, letter) : toggle(q.id, opt)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
                      cursor: submitted ? 'default' : 'pointer',
                      background: showC ? '#dcfce7' : showW ? '#fecaca' : sel ? '#eef2ff' : '#f8fafc',
                      border: `1.5px solid ${showC ? '#86efac' : showW ? '#fca5a5' : sel ? '#6366f1' : '#e2e8f0'}`,
                    }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: q.type === 'multi' ? 4 : 11,
                        border: `2px solid ${sel ? '#6366f1' : '#cbd5e1'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                        background: sel ? '#6366f1' : 'transparent', color: sel ? '#fff' : '#94a3b8',
                      }}>{q.type === 'multi' ? (sel ? '✓' : '') : (sel ? '●' : '')}</span>
                      <span style={{ fontSize: 13, color: '#334155', fontWeight: showC || showW ? 600 : 400 }}>{letter}. {opt}</span>
                      {showC && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓</span>}
                      {showW && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>✗</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Judge: 对/错 buttons */}
            {q.type === 'judge' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                {['对', '错'].map((v) => {
                  const sel = answers[q.id] === v;
                  const isAns = q.answer === v;
                  const showC = submitted && w && isAns;
                  const showW = submitted && w && sel && !isAns;
                  return (
                    <div key={v} onClick={() => pick(q.id, v)} style={{
                      flex: 1, textAlign: 'center', padding: '10px', borderRadius: 8,
                      cursor: submitted ? 'default' : 'pointer',
                      background: showC ? '#dcfce7' : showW ? '#fecaca' : sel ? '#eef2ff' : '#f8fafc',
                      border: `1.5px solid ${showC ? '#86efac' : showW ? '#fca5a5' : sel ? '#6366f1' : '#e2e8f0'}`,
                      fontSize: 14, fontWeight: 600, color: showC ? '#16a34a' : showW ? '#dc2626' : sel ? '#6366f1' : '#64748b',
                    }}>{v}</div>
                  );
                })}
              </div>
            )}

            {/* Fill: text input */}
            {q.type === 'fill' && (
              <div style={{ marginTop: 10 }}>
                <input
                  value={fills[q.id] || ''}
                  onChange={(e) => setFill(q.id, e.target.value)}
                  placeholder="填写答案…"
                  disabled={submitted}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 6, border: `1.5px solid ${w ? '#fca5a5' : fills[q.id] ? '#6366f1' : '#e2e8f0'}`, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Wrong answer feedback */}
            {w && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 12, color: '#dc2626', lineHeight: 1.5 }}>
                {q.type === 'judge' ? `正确答案：${q.answer}` : q.type === 'fill' ? `正确答案：${q.answer}` : `正确答案：${q.answer.split('').join('、')}`}
              </div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <div style={{ textAlign: 'center', padding: '24px 0 48px' }}>
          <button onClick={handleSubmit} style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>提交答卷</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0 48px', fontSize: 13, color: '#94a3b8' }}>已提交 · 得分：{score()} / {QS.length}</div>
      )}
    </div>
  );
}
