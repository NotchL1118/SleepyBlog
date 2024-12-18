import ItemContainer from "../ItemContainer";
// 个人介绍和为什么建站
const myselfIntroduction = [
  "在决定写这个博客之前，我一直想着在学完前后端知识后，自己动手写一个项目来练习。因此，我没有使用市面上成熟的建站框架如 Hexo 或 Typecho，而是选择从零开始，自主开发所有功能模块，例如权限系统、博客和评论模块等模块。每个功能都是从需求分析、架构设计到最终实现，经过多次迭代和优化。 在开发过程中，我逐渐认识了很多个人网站的博主，与他们交流后，我对博客的热情愈发高涨。每当发现 bug 或有新的创意时，我总是忍不住连夜编写代码进行更新。看着这个项目从零开始，一点一点地成长，真的让我感到无比的成就感。这种成就感不仅来自于技术的提升，更来自于能够将自己的想法变成现实，创造出有价值的东西。",
  "我一直都在这里。如果你发现我暂时没有更新文章，不妨去看看开发日志。我会把自己最近的开发进展记录在上面，让你随时了解网站的最新动态。通过开发日志，你可以看到我在技术学习和项目开发中的点滴进步和思考过程。如果你有好的意见或建议，欢迎通过右下方的反馈功能告诉我，我会尽快作出回应。你的反馈是我不断改进和提升的动力。",
  "心可",
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
