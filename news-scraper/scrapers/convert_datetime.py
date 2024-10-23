from nepali.date_converter import converter
from nepali.number import nepalinumber

nepali_months = {
    "वैशाख": 1,
    "जेठ": 2,
    "असार": 3,
    "साउन": 4,
    "भदौ": 5,
    "असोज": 6,
    "कात्तिक": 7,
    "मंसिर": 8,
    "पुष": 9,
    "माघ": 10,
    "फागुन": 11,
    "चैत": 12
}

def convert_nepali_datetime_to_english(nepali_date):
    nep_date_array = nepali_date.split()
    nep_year = int(nepalinumber(nep_date_array[0]))
    nep_month = nep_date_array[1]
    month = nepali_months.get(nep_month)
    nep_day = int(nepalinumber(nep_date_array [2]))
    nep_time = str(nepalinumber(nep_date_array[4].replace(":", ".")))
    
    en_time = (nep_time).replace(".", ":")
    en_year, en_month, en_date = converter.nepali_to_english(nep_year, month, nep_day)
    
    return f"{en_date}-{en_month}-{en_year} {en_time}"
