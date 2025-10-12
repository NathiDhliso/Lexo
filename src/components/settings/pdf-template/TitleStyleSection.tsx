/**
 * TitleStyleSection Component
 * 
 * Controls for PDF document title styling including alignment,
 * font properties, borders, and orientation.
 */

import React from 'react';
import { TitleStyleSectionProps, BorderStyle } from './types';

export const TitleStyleSection: React.FC<TitleStyleSectionProps> = ({ value, onChange }) => {
    const handleChange = <K extends keyof typeof value>(key: K, newValue: typeof value[K]) => {
        onChange({
            ...value,
            [key]: newValue,
        });
    };

    const alignments: Array<{ value: 'left' | 'center' | 'right'; label: string; icon: string }> = [
        { value: 'left', label: 'Left', icon: '⬅️' },
        { value: 'center', label: 'Center', icon: '↔️' },
        { value: 'right', label: 'Right', icon: '➡️' },
    ];

    const orientations: Array<{ value: 'horizontal' | 'vertical'; label: string; icon: string }> = [
        { value: 'horizontal', label: 'Horizontal', icon: '➡️' },
        { value: 'vertical', label: 'Vertical', icon: '⬇️' },
    ];

    const borderStyles: Array<{ value: BorderStyle; label: string }> = [
        { value: 'none', label: 'None' },
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
        { value: 'double', label: 'Double' },
    ];

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Title Style
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Customize the appearance of your document title
                </p>
            </div>

            {/* Alignment */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Text Alignment
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {alignments.map(align => (
                        <button
                            key={align.value}
                            type="button"
                            onClick={() => handleChange('alignment', align.value)}
                            className={`
                p-3 rounded-lg border-2 transition-all text-center
                ${value.alignment === align.value
                                    ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                }
              `}
                        >
                            <div className="text-2xl mb-1">{align.icon}</div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {align.label}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Orientation */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Title Orientation
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {orientations.map(orient => (
                        <button
                            key={orient.value}
                            type="button"
                            onClick={() => handleChange('orientation', orient.value)}
                            className={`
                p-3 rounded-lg border-2 transition-all text-center
                ${value.orientation === orient.value
                                    ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                }
              `}
                        >
                            <div className="text-2xl mb-1">{orient.icon}</div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {orient.label}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Size */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Font Size: {value.fontSize}px
                </label>
                <input
                    type="range"
                    min="12"
                    max="48"
                    value={value.fontSize}
                    onChange={e => handleChange('fontSize', parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
                />
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    <span>12px</span>
                    <span>48px</span>
                </div>
            </div>

            {/* Font Weight */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Font Weight
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleChange('fontWeight', 'normal')}
                        className={`
              p-3 rounded-lg border-2 transition-all text-center
              ${value.fontWeight === 'normal'
                                ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }
            `}
                    >
                        <div className="text-sm font-normal text-neutral-900 dark:text-neutral-100">Normal</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange('fontWeight', 'bold')}
                        className={`
              p-3 rounded-lg border-2 transition-all text-center
              ${value.fontWeight === 'bold'
                                ? 'border-mpondo-gold-500 bg-mpondo-gold-50 dark:bg-mpondo-gold-900/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                            }
            `}
                    >
                        <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Bold</div>
                    </button>
                </div>
            </div>

            {/* Border Style */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Border Style
                </label>
                <select
                    value={value.borderStyle}
                    onChange={e => handleChange('borderStyle', e.target.value as BorderStyle)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
                >
                    {borderStyles.map(style => (
                        <option key={style.value} value={style.value}>
                            {style.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Border Width (only if border style is not 'none') */}
            {value.borderStyle !== 'none' && (
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Border Width: {value.borderWidth}px
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={value.borderWidth}
                        onChange={e => handleChange('borderWidth', parseInt(e.target.value))}
                        className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-mpondo-gold-500"
                    />
                </div>
            )}

            {/* Border Color (only if border style is not 'none') */}
            {value.borderStyle !== 'none' && (
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Border Color
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={value.borderColor}
                            onChange={e => handleChange('borderColor', e.target.value)}
                            className="w-12 h-10 rounded border border-neutral-300 dark:border-neutral-600 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={value.borderColor}
                            onChange={e => handleChange('borderColor', e.target.value)}
                            placeholder="#000000"
                            maxLength={7}
                            className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Preview */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Preview
                </div>
                <div
                    className="p-4 bg-white dark:bg-neutral-900 rounded"
                    style={{
                        textAlign: value.alignment,
                    }}
                >
                    <div
                        style={{
                            fontSize: `${value.fontSize}px`,
                            fontWeight: value.fontWeight,
                            borderBottom:
                                value.borderStyle !== 'none'
                                    ? `${value.borderWidth}px ${value.borderStyle} ${value.borderColor}`
                                    : 'none',
                            display: 'inline-block',
                            writingMode: value.orientation === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
                            textOrientation: value.orientation === 'vertical' ? 'mixed' : 'initial',
                        }}
                        className="text-neutral-900 dark:text-neutral-100"
                    >
                        INVOICE
                    </div>
                </div>
            </div>
        </div>
    );
};
