import React from 'react';

const NeurostimulatorCard = ({ data }) => {
  const {
    lastName = 'ФАМИЛИЯ',
    firstName = 'ИМЯ',
    implantDate = 'ДД.ММ.ГГГГ',
    givenDate = 'ДД.ММ.ГГГГ',
    serialNumber = 'SERIALNUMBERINT',
    modelNumber = 'MODELNUMBERINT'
  } = data;

  const formatDate = (date) => {
    if (!date || date === 'ДД.ММ.ГГГГ') return date;
    if (date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${day}.${month}.${year}`;
    }
    return date;
  };

  return (
    <div className="w-[86mm] h-[54mm] bg-white rounded-md shadow-lg overflow-hidden print:shadow-none relative">
      {/* Верхняя синяя полоса - от края до края */}
      <div className="w-full h-9 bg-indigo-950" />
      
      {/* Нижняя синяя полоса - от края до края */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-indigo-950" />
      
      {/* Логотип Medtronic */}
      <div className="absolute left-[18px] top-[10px] text-white text-xs font-bold font-['Inter']">
        Medtronic
      </div>
      
      {/* Название системы - увеличен шрифт */}
      <div className="absolute left-[15px] bottom-[18px] text-black text-[8px] font-normal font-['Inter']">
        Neuro Stimulation System
      </div>
      
      {/* ФИО пациента - увеличен шрифт */}
      <div className="absolute left-[18px] top-[38px] text-black text-[8px] font-normal font-['Inter']">
        {lastName}
      </div>
      <div className="absolute left-[18px] top-[48px] text-black text-[8px] font-normal font-['Inter']">
        {firstName}
      </div>
      
      {/* Дата выдачи (GIVEN) - увеличен шрифт */}
      <div className="absolute left-[170px] top-[38px] text-black text-[8px] font-normal font-['Inter']">
        GIVEN:
      </div>
      <div className="absolute left-[170px] top-[48px] text-black text-[8px] font-normal font-['Inter']">
        {formatDate(givenDate)}
      </div>
      
      {/* Implant Date - увеличен шрифт */}
      <div className="absolute left-[18px] top-[70px] text-black text-[8px] font-bold font-['Inter']">
        Implant Date
      </div>
      <div className="absolute left-[18px] top-[80px] text-black text-[8px] font-normal font-['Inter']">
        {formatDate(implantDate)}
      </div>
      
      {/* Serial Number - увеличен шрифт */}
      <div className="absolute left-[90px] top-[70px] text-black text-[8px] font-bold font-['Inter']">
        Serial Number
      </div>
      <div className="absolute left-[90px] top-[80px] text-black text-[8px] font-light font-['Inter']">
        {serialNumber}
      </div>
      
      {/* Model Number - увеличен шрифт */}
      <div className="absolute left-[166px] top-[70px] text-black text-[8px] font-bold font-['Inter']">
        Model Number
      </div>
      <div className="absolute left-[166px] top-[80px] text-black text-[8px] font-light font-['Inter']">
        {modelNumber}
      </div>
    </div>
  );
};

export default NeurostimulatorCard;