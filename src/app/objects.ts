export interface dataRooms{
    id: number,
    title: string,
    txt: string,
    tower: string,
    info1: string,
    info2: string,
    info3: string,
    images: Array<string>,
    Left_Or_Right: string
}

export interface login{
    email: string,
    password: string
}

export interface register{
    firstname: string,
    lastname: string,
    contact_number: string,
    email: string,
    password: string,
    gender: string
}

export interface googleDataUser{
    fullName: string,
    email: string,
    response: string
}

export interface mails{
    _id: string,
    IDS: string,
    fullname: string,
    email: string,
    reserved_email: string,
    numGuest: string,  
    contact_num: string,
    message: string,
    dateArrival: string,
    timeDate: string,
    favorite: boolean,
    acceptedNot: string,
    appointmentNot: boolean,
    newNot: boolean,   
}

export interface schedAppointment{
    _id: string,
    IDS: string,
    fullname: string,
    email: string,
    numGuest: string,
    contact_num: string,
    message: string,
    timeDate: string,
    date: string,
    appointmentNot: boolean
}

export interface date{
    day: string,
    month: string,
    year: string
}

export interface timeDate{
    PM: Array<string>,
    AM: Array<string>,
    DATE: Array<date>;
}

export interface calendarApp{
    id: string,
    Subject: string,
    Description: string,
    StartTime: Date,
    EndTime: Date
}