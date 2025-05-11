import ItemContainer from "../ItemContainer";
// 个人介绍和为什么建站
const myselfIntroduction = [
  "Hello World! 我是一名前端开发工程师，目前就职于一家互联网公司。",
  "我热爱编程，喜欢折腾，喜欢学习新技术，喜欢分享。",
  "这里记得换成markdown格式的",
  "大致目标：",
  "先有功能 -> 再有样式, 先完成 -> 再完美",
];
const MySelf = () => {
  return (
    <ItemContainer title="关于我">
      <p className="text-center text-sm">心路旅程</p>
      <p className="text-center text-3xl font-[550]">关于我</p>
      <div>
        {myselfIntroduction.map((item, index) => (
          <div key={index} className="indent-4 text-base font-[400]">
            {item}
          </div>
        ))}
      </div>
    </ItemContainer>
  );
};
export default MySelf;
