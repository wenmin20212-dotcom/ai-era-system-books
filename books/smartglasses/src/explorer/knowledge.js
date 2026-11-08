export const components=[
{id:'frame',name:'镜框与镜腿',terms:['镜框','镜腿','佩戴','重量','整机集成'],types:['camera','display','ar'],desc:'提供支撑和佩戴定位，并为电路、电池及声学组件提供空间。位置和外形为教学表达。'},
{id:'camera',name:'摄像头',terms:['摄像','视觉感知','图像','第一视角','拍照','录像'],types:['camera','ar'],desc:'采集镜头视野中的图像。采集范围与佩戴者的视线并不完全相同，使用中还需理解指示与隐私边界。'},
{id:'mic',name:'麦克风',terms:['麦克风','声音','语音','声学','说话','采集'],types:['camera','display','ar'],desc:'把声音转换为电信号，再进入采样与处理流程。数量、位置与降噪方法随具体产品而变化。'},
{id:'speaker',name:'扬声器',terms:['扬声器','声音','声学','音乐','接电话','耳朵','播放'],types:['camera','display','ar'],desc:'把处理后的音频信号转为声音。开放式声学需要兼顾听清内容、声音泄漏与环境感知。'},
{id:'soc',name:'处理器与存储',terms:['芯片','处理器','存储','计算','数据','本地','AI','交互','编码'],types:['camera','display','ar'],desc:'承担本地计算、控制与数据缓存；与手机、云端之间的分工取决于具体系统。此处为功能组合示意。'},
{id:'battery',name:'电池与电源',terms:['电池','电量','供电','能量','热','温','功耗','续航'],types:['camera','display','ar'],desc:'为整机提供能量，供电与功耗控制共同影响续航和温升。示意中的形状和放置位置不代表实际产品。'},
{id:'antenna',name:'无线连接',terms:['天线','连接','网络','断网','无线','手机','云端','同步'],types:['camera','display','ar'],desc:'连接眼镜、手机或其他网络节点。能否独立联网及各项无线能力需要按型号核验。'},
{id:'display',name:'显示与光学',terms:['显示','光学','光的','光如何','折射','反射','虚像','眼睛','视觉','视野'],types:['display','ar'],desc:'把显示图像送入眼睛。近眼显示存在多种光学方案，本模型仅表示显示光路与镜片的功能联系。'},
{id:'imu',name:'运动与空间感知',terms:['传感','空间','位置','头部','运动','坐标','定位','误差'],types:['ar'],desc:'以运动传感为切入点理解位置、姿态与误差。完整空间AR还依赖视觉、标定与软件协同，并非单靠一颗传感器。'}
];
export function related(section, component) { return section.componentIds.includes(component.id); }
export function available(type){return components.filter(c=>c.types.includes(type));}
