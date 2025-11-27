
export default function StatsCard({ title, value, change, changeType, icon, color }) {
  const formatLakh = (num = 0) => {
    if (num >= 100000) {
      // 1 lakh or more
      return (num / 100000)?.toFixed(num % 100000 === 0 ? 0 : 1) + 'L';
    } else if (num >= 1000) {
      // 1 thousand or more
      return (num / 1000)?.toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
    } else {
      // below 1 thousand
      return num
    }
  }
console.log("valuevaluevalue:==>",value)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatLakh(value)}</p>
          {change && (
            <div className="flex items-center mt-2">
              <i className={`${changeType === 'positive' ? 'ri-arrow-up-line text-green-500' : 'ri-arrow-down-line text-red-500'} text-sm mr-1`}></i>
              <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <i className={`${icon} text-xl text-white`}></i>
        </div>
      </div>
    </div>
  );
}
