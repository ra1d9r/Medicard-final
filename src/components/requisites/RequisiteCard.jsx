import React from 'react';
import CardiomonitorCard from './CardiomonitorCard';
import NeurostimulatorCard from './NeurostimulatorCard';

const RequisiteCard = ({ requisite }) => {
  const { templateName, data, templateType } = requisite;
  
  console.log('🃏 Рендер карточки:', { templateName, templateType });
  
  // Проверяем по templateType
  if (templateType === 'neurostimulator') {
    return <NeurostimulatorCard data={data} />;
  }
  
  // Проверяем по templateName
  if (templateName?.toLowerCase().includes('нейростимулятор') || 
      templateName?.toLowerCase().includes('neurostimulator') ||
      templateName?.toLowerCase().includes('medtronic')) {
    return <NeurostimulatorCard data={data} />;
  }
  
  // По умолчанию - кардиомонитор
  return <CardiomonitorCard data={data} />;
};

export default RequisiteCard;