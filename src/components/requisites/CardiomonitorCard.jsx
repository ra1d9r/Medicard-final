import React from 'react';

const CardiomonitorCard = ({ data }) => {
  const {
    lastName = 'ФАМИЛИЯ',
    firstName = 'ИМЯ',
    birthDate = 'ДД.ММ.ГГГГ',
    serialNumber = 'SERIALNUMBERINT',
    issueDate = 'ДД.ММ.ГГГГ'
  } = data;

  // Форматируем даты если они в формате YYYY-MM-DD
  const formatDate = (date) => {
    if (!date || date === 'ДД.ММ.ГГГГ') return date;
    if (date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${day}.${month}.${year}`;
    }
    return date;
  };

  return (
    <div className="w-[86mm] h-[54mm] bg-gradient-to-l from-stone-500 to-red-600 rounded-md shadow-lg overflow-hidden print:shadow-none">
      <div className="relative w-full h-full p-3">
        {/* Верхняя часть с ФИО и датой рождения */}
        <div className="flex justify-between items-start text-white text-xs">
          <div className="font-medium">
            {lastName} {firstName}
          </div>
          <div className="font-light">
            {formatDate(birthDate)}
          </div>
        </div>

        {/* Логотип и название устройства */}
        <div className="mt-3 text-center">
          <div className="text-white/20 text-[10px] font-extralight tracking-wider">
            CONFIRM Rx ICM
          </div>
          <div className="text-white text-sm font-medium tracking-wide mt-0.5">
            CONFIRM Rx
          </div>
        </div>

        {/* Нижняя часть с серийным номером и датой выдачи */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex justify-between items-end text-white text-xs">
            <div>
              <span className="font-normal">D:</span>
              <span className="font-light ml-1">{formatDate(issueDate)}</span>
            </div>
            <div>
              <span className="font-normal">SN:</span>
              <span className="font-light ml-1">{serialNumber}</span>
            </div>
          </div>
        </div>

        {/* Декоративная полоса (стилизация как на оригинале) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-zinc-300/20 rounded-sm" />
      </div>
    </div>
  );
};

export default CardiomonitorCard;