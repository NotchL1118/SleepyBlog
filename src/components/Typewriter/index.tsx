"use client";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";

interface TypewriterProps {
  /**
   * 要显示的字符串数组
   */
  texts: string[];
  /**
   * 打字速度(毫秒)
   */
  typingSpeed?: number;
  /**
   * 删除速度(毫秒)
   */
  deletingSpeed?: number;
  /**
   * 完成一句话后的暂停时间(毫秒)
   */
  pauseTime?: number;
  /**
   * 文本样式类
   */
  className?: string;
  /**
   * 文本样式类
   */
  textClassName?: string;
  /**
   * 光标颜色
   */
  cursorColor?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({
  texts,
  typingSpeed = 150,
  deletingSpeed = 75,
  pauseTime = 1500,
  className = "",
  cursorColor = "#3b82f6", // 默认使用蓝色
  textClassName = "",
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    let timeout: NodeJS.Timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, pauseTime);
      return () => clearTimeout(timeout);
    }

    const currentText = texts[currentIndex];

    if (isTyping) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        setIsPaused(true);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [texts, currentIndex, displayText, isTyping, isPaused, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <div className={`${styles.container} ${className}`}>
      <span className={`${styles.text} ${textClassName}`}>{displayText}</span>
      <span
        className={styles.cursor}
        style={{
          backgroundColor: cursorColor,
          boxShadow: `0 0 5px ${cursorColor}`,
        }}
      ></span>
    </div>
  );
};

export default Typewriter;
