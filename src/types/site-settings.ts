// 网站设置相关类型定义

export interface SiteSettings {
  _id?: string;
  // 基本信息
  siteName: string;
  siteDescription: string;
  siteKeywords: string[];
  siteUrl: string;

  // SEO 设置
  defaultMetaDescription: string;
  defaultMetaKeywords: string[];

  // 社交媒体
  socialLinks: {
    github?: string;
    twitter?: string;
    email?: string;
    linkedin?: string;
    instagram?: string;
  };

  // 主题和样式
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };

  // 统计和分析
  analytics: {
    googleAnalyticsId?: string;
    baiduAnalyticsId?: string;
    enableTracking: boolean;
  };

  // 其他设置
  navigation: {
    showCategories: boolean;
    showTags: boolean;
    showArchive: boolean;
  };

  createdAt?: Date | string;
  updatedAt?: Date | string;
}

