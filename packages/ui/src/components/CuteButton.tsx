import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../styles/theme';

// 弹跳动画
const bounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

// 脉冲动画
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 154, 139, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 154, 139, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 154, 139, 0); }
`;

// 彩虹渐变动画
const rainbow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// 旋转动画
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Button = styled.button<{
  $variant?: 'primary' | 'secondary' | 'cute';
  $size?: 'small' | 'medium' | 'large';
  $isActive?: boolean;
  $isPlaying?: boolean;
}>`
  position: relative;
  border: none;
  border-radius: ${theme.borderRadius.full};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${theme.fonts.primary};
  font-weight: 600;
  transition: all ${theme.transitions.fast};
  overflow: hidden;
  
  /* 尺寸 */
  ${props => {
    switch (props.$size) {
      case 'small':
        return css`
          width: 36px;
          height: 36px;
          font-size: ${theme.fontSizes.sm};
        `;
      case 'large':
        return css`
          width: 64px;
          height: 64px;
          font-size: ${theme.fontSizes.xl};
        `;
      default:
        return css`
          width: 48px;
          height: 48px;
          font-size: ${theme.fontSizes.lg};
        `;
    }
  }}
  
  /* 变体样式 */
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, #FF9A8B, #FFB3BA, #FFAAA5);
          background-size: 300% 300%;
          color: white;
          box-shadow: ${theme.shadows.md};
          animation: ${props.$isPlaying ? css`${rainbow} 3s ease infinite` : 'none'};
          
          &:hover {
            animation: ${rainbow} 3s ease infinite, ${bounce} 0.6s ease;
            box-shadow: ${theme.shadows.lg};
          }
          
          &:active {
            transform: scale(0.95);
          }
        `;
      case 'secondary':
        return css`
          background: ${theme.colors.surface};
          color: ${theme.colors.text.primary};
          border: 2px solid ${theme.colors.border};
          
          &:hover {
            background: ${theme.colors.surfaceHover};
            border-color: ${theme.colors.primary};
            transform: scale(1.05);
          }
          
          &:active {
            transform: scale(0.95);
          }
        `;
      default:
        return css`
          background: linear-gradient(135deg, #FFB3BA, #FFAAA5, #FFD1DC);
          background-size: 300% 300%;
          color: ${theme.colors.text.primary};
          box-shadow: ${theme.shadows.sm};
          
          &:hover {
            animation: ${rainbow} 2s ease infinite, ${bounce} 0.4s ease;
            box-shadow: ${theme.shadows.md};
          }
          
          &:active {
            transform: scale(0.95);
          }
        `;
    }
  }}
  
  /* 激活状态 */
  ${props => props.$isActive && css`
    background: ${theme.gradients.primary};
    color: white;
    animation: ${pulse} 2s infinite;
  `}
  
  /* 禁用状态 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    animation: none !important;
  }
  
  /* 播放状态的特殊效果 */
  ${props => props.$isPlaying && props.$variant === 'primary' && css`
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, #FF9A8B, #FFB3BA, #FFAAA5, #FFD1DC);
      border-radius: ${theme.borderRadius.full};
      z-index: -1;
      animation: ${rotate} 3s linear infinite;
    }
  `}
`;

const ButtonContent = styled.span<{ $isPlaying?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  
  ${props => props.$isPlaying && css`
    animation: ${bounce} 1s ease-in-out infinite;
  `}
`;

interface CuteButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'cute';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  isActive?: boolean;
  isPlaying?: boolean;
  title?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

export const CuteButton: React.FC<CuteButtonProps> = ({
  children,
  onClick,
  variant = 'cute',
  size = 'medium',
  disabled = false,
  isActive = false,
  isPlaying = false,
  title,
  className,
  type = 'button',
  style
}) => {
  return (
    <Button
      onClick={onClick}
      $variant={variant}
      $size={size}
      disabled={disabled}
      $isActive={isActive}
      $isPlaying={isPlaying}
      title={title}
      className={className}
      type={type}
      style={style}
    >
      <ButtonContent $isPlaying={isPlaying}>
        {children}
      </ButtonContent>
    </Button>
  );
};
