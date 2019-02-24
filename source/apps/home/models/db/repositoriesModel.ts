////////////////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)                                                                  //
//                                                                                        //
// Copyright (C) 2016  Chriss Mejía - me@chrissmejia.com - chrissmejia.com                //
//                                                                                        //
// Permission is hereby granted, free of charge, to any person obtaining a copy           //
// of this software and associated documentation files (the "Software"), to deal          //
// in the Software without restriction, including without limitation the rights           //
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell              //
// copies of the Software, and to permit persons to whom the Software is                  //
// furnished to do so, subject to the following conditions:                               //
//                                                                                        //
// The above copyright notice and this permission notice shall be included in all         //
// copies or substantial portions of the Software.                                        //
//                                                                                        //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR             //
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,               //
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE            //
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER                 //
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,          //
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE          //
// SOFTWARE.                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////

import { field, secret, Fields, Defaults, Datatypes, Models, Model } from "@unicoderns/orm"

export interface Row {
    id?: number;
    created?: number;
    name: string;
    url: string;
    mount: string;
    folder: string;
    synced?: number;
}

export class Repositories extends Model {

    @field()
    public id: Fields.SystemTypes = new Datatypes().ID();    

    @field()
    public created: Fields.DataTimestampType = new Datatypes().TIMESTAMP({
        notNull: true,
        default: Defaults.Timestamp.CURRENT_TIMESTAMP
    });

    @field()
    public name: Fields.SystemTypes = new Datatypes().VARCHAR({
        size:45,
        notNull: true,
        unique: true
    });

    @field()
    public url: Fields.SystemTypes = new Datatypes().VARCHAR({
        size: 90,
        notNull : true
    });

    @field()
    public folder: Fields.SystemTypes = new Datatypes().VARCHAR({
        size:45,
        notNull: true
       
    });

    @field()
    public synced: Fields.DataTimestampType = new Datatypes().TIMESTAMP({
        default: Defaults.Timestamp.CURRENT_TIMESTAMP
    });

}