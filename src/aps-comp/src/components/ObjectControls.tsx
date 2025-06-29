import React from "react";
import type { Transformations } from "../types.ts";

interface ObjectControlsProps {
  transformations: Transformations;
  onTransformChange: (newTransforms: Transformations) => void;
  onReset: () => void;
}

const SliderControl: React.FC<{
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
}> = ({ label, value, onChange, min, max, step }) => (
  <div className="grid grid-cols-3 gap-2 items-center">
    <label htmlFor={label} className="text-sm font-medium text-gray-400">
      {label}
    </label>
    <input
      type="range"
      id={label}
      name={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="col-span-2 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

const ObjectControls: React.FC<ObjectControlsProps> = ({
  transformations,
  onTransformChange,
  onReset,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTransformChange({
      ...transformations,
      [e.target.name]: parseFloat(e.target.value),
    });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-white">Transformações</h3>
        <button
          onClick={onReset}
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          Resetar
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-300">Translação</h4>
        <SliderControl
          label="tx"
          value={transformations.tx}
          onChange={handleChange}
          min={-200}
          max={200}
          step={1}
        />
        <SliderControl
          label="ty"
          value={transformations.ty}
          onChange={handleChange}
          min={-200}
          max={200}
          step={1}
        />
        <SliderControl
          label="tz"
          value={transformations.tz}
          onChange={handleChange}
          min={-200}
          max={200}
          step={1}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-300">Rotação</h4>
        <SliderControl
          label="rx"
          value={transformations.rx}
          onChange={handleChange}
          min={0}
          max={360}
          step={1}
        />
        <SliderControl
          label="ry"
          value={transformations.ry}
          onChange={handleChange}
          min={0}
          max={360}
          step={1}
        />
        <SliderControl
          label="rz"
          value={transformations.rz}
          onChange={handleChange}
          min={0}
          max={360}
          step={1}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-300">Escala</h4>
        <SliderControl
          label="sx"
          value={transformations.sx}
          onChange={handleChange}
          min={0.1}
          max={5}
          step={0.1}
        />
        <SliderControl
          label="sy"
          value={transformations.sy}
          onChange={handleChange}
          min={0.1}
          max={5}
          step={0.1}
        />
        <SliderControl
          label="sz"
          value={transformations.sz}
          onChange={handleChange}
          min={0.1}
          max={5}
          step={0.1}
        />
      </div>
    </div>
  );
};

export default ObjectControls;
