import type { ICategory } from "@/types/category";
import { memo, useEffect, useState } from "react";
import { BaseDialog } from "./BaseDialog";
import { DialogForm } from "./DialogForm";

interface EditDialogProps {
  isOpen: boolean;
  category: ICategory | null;
  onClose: () => void;
  onSave: (categoryId: string, name: string, slug: string) => Promise<void>;
}

/**
 * 编辑分类对话框
 */
export const EditDialog = memo(function EditDialog({ isOpen, category, onClose, onSave }: EditDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});

  // 当分类改变时，更新表单
  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setErrors({});
    }
  }, [category]);

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
    if (!category || !validate()) return;

    try {
      setIsSubmitting(true);
      await onSave(category._id, name.trim(), slug.trim());
      handleClose();
    } catch (error) {
      console.error("Update category error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      title="编辑分类"
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitText="保存"
      submitDisabled={!name.trim() || !slug.trim()}
      isSubmitting={isSubmitting}
    >
      <DialogForm name={name} slug={slug} onNameChange={setName} onSlugChange={setSlug} nameError={errors.name} slugError={errors.slug} />
    </BaseDialog>
  );
});
