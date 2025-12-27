import type { SiteSettings } from "@/types/site-settings";
import mongoose, { Document, Schema } from "mongoose";

// MongoDB文档接口：继承Document并使用SiteSettings类型
export interface ISiteSettings extends Document, Omit<SiteSettings, "_id" | "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

// 网站设置模式定义
const SiteSettingsSchema: Schema = new Schema(
  {
    // 基本信息
    siteName: {
      type: String,
      required: [true, "网站名称是必填项"],
      trim: true,
      maxlength: [100, "网站名称不能超过100个字符"],
      default: "SleepYoung's Blog",
    },
    siteDescription: {
      type: String,
      required: [true, "网站描述是必填项"],
      trim: true,
      maxlength: [500, "网站描述不能超过500个字符"],
      default: "一个简洁优雅的个人博客",
    },
    siteKeywords: {
      type: [String],
      default: ["博客", "技术", "生活"],
      validate: {
        validator: function (keywords: string[]) {
          return keywords.length <= 20;
        },
        message: "关键词数量不能超过20个",
      },
    },
    siteUrl: {
      type: String,
      required: [true, "网站URL是必填项"],
      trim: true,
      validate: {
        validator: function (url: string) {
          return /^https?:\/\//.test(url);
        },
        message: "请输入有效的网站URL",
      },
    },

    // SEO 设置
    defaultMetaDescription: {
      type: String,
      maxlength: [160, "默认描述不能超过160个字符"],
      default: "SleepYoung's Blog - 记录技术与生活",
    },
    defaultMetaKeywords: {
      type: [String],
      default: ["博客", "技术分享", "个人网站"],
    },

    // 社交媒体链接
    socialLinks: {
      github: {
        type: String,
        validate: {
          validator: function (url: string) {
            return !url || /^https?:\/\/github\.com\//.test(url);
          },
          message: "请输入有效的GitHub链接",
        },
      },
      twitter: {
        type: String,
        validate: {
          validator: function (url: string) {
            return !url || /^https?:\/\/(twitter\.com|x\.com)\//.test(url);
          },
          message: "请输入有效的Twitter/X链接",
        },
      },
      email: {
        type: String,
        validate: {
          validator: function (email: string) {
            return !email || /^\S+@\S+\.\S+$/.test(email);
          },
          message: "请输入有效的邮箱地址",
        },
      },
      linkedin: String,
      instagram: String,
    },

    // 主题和样式设置
    theme: {
      primaryColor: {
        type: String,
        default: "#3B82F6",
        validate: {
          validator: function (color: string) {
            return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
          },
          message: "请输入有效的颜色值（如#3B82F6）",
        },
      },
      secondaryColor: {
        type: String,
        default: "#64748B",
        validate: {
          validator: function (color: string) {
            return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
          },
          message: "请输入有效的颜色值（如#64748B）",
        },
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
    },

    // 统计和分析
    analytics: {
      googleAnalyticsId: {
        type: String,
        validate: {
          validator: function (id: string) {
            return !id || /^(G-|UA-|GT-|AW-)/.test(id);
          },
          message: "请输入有效的Google Analytics ID",
        },
      },
      baiduAnalyticsId: String,
      enableTracking: {
        type: Boolean,
        default: false,
      },
    },

    // 导航设置
    navigation: {
      showCategories: {
        type: Boolean,
        default: true,
      },
      showTags: {
        type: Boolean,
        default: true,
      },
      showArchive: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
    collection: "site_settings", // 指定集合名称
  }
);

// 添加索引
SiteSettingsSchema.index({ siteName: 1 });

// 预保存钩子：数据清理和验证
SiteSettingsSchema.pre("save", function (next) {
  // 清理社交媒体链接中的空字符串
  if (this.socialLinks) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const links = this.socialLinks as any;
    Object.keys(links).forEach((key) => {
      if (links[key] === "") {
        links[key] = undefined;
      }
    });
  }

  // 清理空的关键词
  if (this.siteKeywords && Array.isArray(this.siteKeywords)) {
    this.siteKeywords = this.siteKeywords.filter((keyword: string) => keyword.trim() !== "");
  }

  if (this.defaultMetaKeywords && Array.isArray(this.defaultMetaKeywords)) {
    this.defaultMetaKeywords = this.defaultMetaKeywords.filter((keyword: string) => keyword.trim() !== "");
  }

  next();
});

// 静态方法：获取或创建默认设置
SiteSettingsSchema.statics.getOrCreateDefault = async function () {
  let settings = await this.findOne({});

  if (!settings) {
    // 如果没有设置，创建默认设置
    settings = new this({});
    await settings.save();
  }

  return settings;
};

// 实例方法：重置为默认值
SiteSettingsSchema.methods.resetToDefaults = function () {
  const defaults = {
    siteName: "SleepYoung's Blog",
    siteDescription: "一个简洁优雅的个人博客",
    siteKeywords: ["博客", "技术", "生活"],
    defaultMetaDescription: "SleepYoung's Blog - 记录技术与生活",
    defaultMetaKeywords: ["博客", "技术分享", "个人网站"],
    socialLinks: {},
    theme: {
      primaryColor: "#3B82F6",
      secondaryColor: "#64748B",
      darkMode: false,
    },
    analytics: {
      enableTracking: false,
    },
    navigation: {
      showCategories: true,
      showTags: true,
      showArchive: true,
    },
  };

  Object.assign(this, defaults);
  return this.save();
};

// 检查模型是否已经存在，避免重复编译
const SiteSettingsModel =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettingsModel;
