/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */



export function getReadableDateFromMs(ts_milliseconds) {
    let date = new Date(ts_milliseconds);
    return  date.toLocaleDateString();
}
export function getReadableDateTime() {
    let date = new Date();
    return  date.toLocaleDateString()+" "+date.toLocaleTimeString();
}
export function getReadableDateTimeFromMs(ts_milliseconds) {
    let date = new Date(ts_milliseconds);
    return (1+date.getMonth())+"/"+date.getDate()+"/"+date.getFullYear()+" "+date.toLocaleTimeString();
}
function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}
export function getDateTimeFileName(date: Date) {

    let fn=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"_"+date.getHours()+"-"+date.getMinutes()+"-"+date.getSeconds();
    return fn;
}
export function getDateTimeFileNameCurrent() {

    return getDateTimeFileName(new Date());
}
export function getTodayAgeFromBdayStr(bday:string) {
    let d=new Date(bday);
    let diff=Date.now()-d.valueOf();
    let ageDate=new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
export function getAgeFromBirthDate(fromday:Date,bday:Date) {
    let diff=fromday.valueOf()-bday.valueOf();
    let ageDate=new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
export function getAgeFromBday(fromday:Date,day, month, year) {
    day = parseInt(day);
    month = parseInt(month);
    year = parseInt(year);
    if(year<20)
        year+=2000;
    if(year<100)
        year+=1900;
    if (
        ((day < 1) || (day > 31)) ||
        ((month < 1) || (month > 12)) ||
        ((year < 1900) || (year > 2030))) {
        return false;
    }

    //let today = new Date();
    let tm = fromday.getMonth() + 1;
    let td = fromday.getDate();
    let age = fromday.getFullYear() - year;

    if ((tm < month) || ((tm == month) && (td < day))) {
        age--;
    }
    return age;
}

export function formatDateAsTime(date,show_ms=true,local=false,show_zero_hours=false):string
{

    let hours = (local ? date.getHours() : date.getUTCHours());
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let ms =  Math.floor(date.getMilliseconds()/100);
    let formattedTime =  minutes.substr(-2) + ':' + seconds.substr(-2);
    if(show_ms)
        formattedTime=formattedTime+ '.' + ms;
    if(hours || show_zero_hours)
    {
        hours = " "+hours;
        formattedTime=hours.substr(-2) + ':' + formattedTime;
    }
    return formattedTime;
}
export function timeStrToSec(timeStr : string) :number{
    if (typeof timeStr !="string" )
        return 0;
    let sec=timeStr.split('.');
    let p=timeStr.split(':');
    let p0=parseInt(p[0]);
    let p1=parseInt(p[1]);
    let secs=0;
    if(p.length==2)
    {
        secs= (p0*60+p1);
    }
    if(p.length==3)
    {
        let p2=parseInt(p[2]);
        secs= (p0*60*60+p1*60+p2);
    }
    return secs;
}

export function convertUTCDateToLocalDate(date) {

    var newDate = new Date(date.getTime()-date.getTimezoneOffset()*60*1000);
    return newDate;
}
export function formatTimestamp_ms(ts:number,show_ms=true,local=false,show_zero_hours=false) : string
{

    let date=new Date();

    date.setTime(ts);
    return formatDateAsTime(date,show_ms,local,show_zero_hours);
}
export function formatUnixTime(ts:number,local=false) : string
{
    let date=new Date(ts*1000);
    let hours = (local ? date.getHours() : date.getUTCHours());
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let formattedTime =  minutes.substr(-2) + ':' + seconds.substr(-2) ;
    if(hours)
    {
        formattedTime=hours + ':' + formattedTime;
    }
    return formattedTime;
}
export function secToTimeStr(sec: number) :string {
    if (!sec)
        return "";
    sec=Number(sec);

    sec = Math.round(sec);
    let str = "";
    let hours : number= Math.floor(sec / (60 * 60));
    sec -= hours * 60 * 60;
    let mins: number = Math.floor(sec / (60));
    sec -= mins * 60;

    if (hours) {
        str = hours + ":" + ("0" + mins).substr(-2);
    } else
        str = mins.toString();
    str += ":" + ("0" + sec).substr(-2);
    return str;
}

