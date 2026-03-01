import { memo, useState } from "react";
import { BaseDialog } from "./BaseDialog";
import { DialogForm } from "./DialogForm";

interface CreateDialogProps {
  isOpen: boolean;
  defaultName?: string;
  onClose: () => void;
  onCreate: (name: string, slug: string) => Promise<void>;
}

/**
 * 创建分类对话框
 */
export const CreateDialog = memo(function CreateDialog({ isOpen, defaultName = "", onClose, onCreate }: CreateDialogProps) {
  const [name, setName] = useState(defaultName);
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});

  // 重置状态
  const handleClose = () => {
    if (isSubmitting) return;
    setName("");
    setSlug("");
    setErrors({});
    onClose();
  };

  // 验证表单
  const validate = (): boolean => {
    const newErrors: { name?: string; slug?: string } = {};

    if (!name.trim()) {
      newErrors.name = "请输入分类名称";
    }

    if (!slug.trim()) {
      newErrors.slug = "请输入 slug";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = "Slug 只能包含小写字母、数字和连字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onCreate(name.trim(), slug.trim());
      handleClose();
    } catch (error) {
      console.error("Create category error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      title="创建分类"
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitText="创建"
      submitDisabled={!name.trim() || !slug.trim()}
      isSubmitting={isSubmitting}
    >
      <DialogForm name={name} slug={slug} onNameChange={setName} onSlugChange={setSlug} nameError={errors.name} slugError={errors.slug} />
    </BaseDialog>
  );
});
