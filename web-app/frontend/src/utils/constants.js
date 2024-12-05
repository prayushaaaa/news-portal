import UserData from "../views/plugin/UserData";

export const API_BASE_URL = "https://django-test.maya-wears.com/api/v1/";
export const SERVER_URL = "https://django-test.maya-wears.com";
export const CLIENT_URL = "https://test.maya-wears.com/";
export const PAYPAL_CLIENT_ID = "test";
export const CURRENCY_SIGN = "$";
export const userId = UserData()?.user_id;
export const teacherId = UserData()?.teacher_id;
console.log(teacherId);
