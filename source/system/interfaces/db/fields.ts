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

import * as defaults from "./defaults";

// export enum Privacy {"PUBLIC", "PRIVATE", "PROTECTED"};

// JSloth internal flags
export interface SystemTypes {
    type?: string;
    alias?: string;
    protected?: boolean;
    private?: boolean;
}

export interface CommonTypes extends SystemTypes {
    primaryKey?: boolean;
    notNull?: boolean;
    unique?: boolean;
    // binary?: boolean;
    unsigned?: boolean;
    zeroFill?: boolean;
    autoincrement?: boolean;
    generated?: boolean;
}

/*** Datatype interface. */
export interface DataType extends CommonTypes {
    size?: number;
}

export interface VarCharType extends CommonTypes {
    size: number;
}

export interface FloatType extends CommonTypes {
    size?: number;
    precision?: number;
}

export interface BoolType extends CommonTypes {
    default: defaults.Binary;
}

export interface DataTimestampType extends CommonTypes {
    default: defaults.Timestamp;
}

/**
 * Foreign key to static enum model
 */

export interface StaticKey extends DataType {
    keys: any;
}
