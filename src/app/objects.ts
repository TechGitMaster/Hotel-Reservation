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
    confirmPass: string,
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
    appointmentNot: string,
    newNot: boolean,   
    folderName: string,
    guest_member: string,
    transaction_ID: string,
    deleteNot: string
}

export interface schedAppointment{
    _id: string,
    IDS: string,
    fullname: string,
    email: string,
    reserved_email: string,
    numGuest: string,
    contact_num: string,
    message: string,
    timeDate: string,
    date: string,
    transaction_ID: string,
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

export interface room{
    _id: string,
    nameRoom: string,
    addInfo: string,
    defaultPrice: string,
    goodPersons: string,
    pricePersons: string,
    typeRoom: boolean,
    typeRoom2: string,
    imgArr: Array<Array<string>>,

    account_id: string,
    checkin_date: string,
    checkout_date: string,
    acquired_persons: string,
    persons_price: string,
    total_price: string,
    first_name: string,
    last_name: string,
    phone_number: string,
    email: string,
    image_transaction: Array<Array<any>>,
    transaction_date: string,
    confirmation_date: string,

    confirmNot: string,
}

export interface reservation{
    _id: string,
    room_id: string,
    email_id: string,

    img_room: Array<string>,
    name_room: string,
    typeRoom2: string,

    defaultPrice: string,
    paymentMethod: string,

    checkin_date: string,
    checkout_date: string,
    acquired_persons: string,
    persons_price: string,
    total_price: string,
    first_name: string,
    last_name: string,
    phone_number: string,
    email: string,
    image_transaction: Array<Array<string>>,
    confirmation_date: string,
    transaction_date: string,
    guest_member: string,
    transaction_id: string,

    confirmNot: string
}


export interface getRoomsLandpage{
    _id: string,
    nameRoom: string,
    addInfo: string,
    defaultPrice: string,
    goodPersons: string,
    pricePersons: string,
    typeRoom: boolean,
    typeRoom2: string,
    imgArr: any,
    confirmNot: string,
    Left_Or_Right: string
}


export interface notification_user{
    _id: string,
    email: string,
    name: string,
    message: string,
    date: string,
    deleteNot: string
}

export interface appointment_user{
    _id: string,
    fullname: string,
    email: string,
    reserved_email: string,
    numGuest: string,
    contact_num: string,
    message: string,
    dateArrival: string,
    timeDate: string,
    acceptedNot: string,
    newNot: boolean,
    deleteNot: boolean,
    guest_member: string,
    transaction_ID: string
}

export interface ImageFacilities{
    url: string;
    row: string;
    col: string;
}