import ItemContainer from "../ItemContainer";

interface GoalItem {
  id: number;
  content: string;
  status: "completed" | "pending" | "inProgress";
}

const goals: GoalItem[] = [
  { id: 1, content: "拿到月薪过万的 Offer~", status: "pending" },
  { id: 2, content: "学习 uniapp 小兔鲜项目", status: "completed" },
  { id: 3, content: "学习 Spring Boot 苍穹外卖项目", status: "completed" },
  { id: 4, content: "学习 React 达到找工作水平", status: "completed" },
  { id: 5, content: "学习 TailwindCSS 达到找工作水平", status: "completed" },
  { id: 6, content: "学习 Nextjs 达到找工作水平", status: "completed" },
  { id: 7, content: "入手 MacBook 生产力神器", status: "completed" },
  { id: 8, content: "完成 ThriveX 项目重构", status: "completed" },
  { id: 9, content: "ThriveX 博客管理系统 Star 破百", status: "completed" },
  { id: 10, content: "刷 100 道面试题", status: "inProgress" },
];

const Goal = () => {
  const renderDefaultView = () => (
    <div>
      <div>不畏将来，不念过往</div>
    </div>
  );

  const renderGoalListView = () => (
    <div className="text-sm">
      {goals.map((goal) => (
        <div key={goal.id} className="flex items-center justify-between rounded-lg p-2 transition-all hover:bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={goal.status === "completed"}
              readOnly
              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
            />
            <span className={`${goal.status === "completed" ? "text-gray-500" : "text-gray-900"}`}>
              {goal.id}、{goal.content}
            </span>
          </div>
          <span
            className={`text-xs ${
              goal.status === "completed"
                ? "text-green-500"
                : goal.status === "pending"
                  ? "text-red-500"
                  : "text-yellow-500"
            }`}
          >
            {goal.status === "completed" ? "已完成" : goal.status === "pending" ? "未完成" : "待完成"}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <ItemContainer title="2025年度目标">
      <div className="no-scrollbar group relative min-h-80 overflow-auto">
        {/* Default View */}
        <div className="absolute inset-0 opacity-100 transition-opacity duration-100 ease-in-out group-hover:opacity-0">
          {renderDefaultView()}
        </div>

        {/* Hover View */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-100 ease-in-out group-hover:opacity-100">
          {renderGoalListView()}
        </div>
      </div>
    </ItemContainer>
  );
};

export default Goal;
