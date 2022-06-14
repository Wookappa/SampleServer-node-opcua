// Copyright 2021 (c) Andreas Heine
//
//   Licensed under the Apache License, Version 2.0 (the 'License');
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an 'AS IS' BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.

import { 
    coerceLocalizedText, 
    DataType,
    UAVariable,
    UAObject,
    AddressSpace,
    UAObjectType,
    Variant,
    StatusCodes,
} from 'node-opcua'

export const createMyMachineLogic = async (addressSpace: AddressSpace): Promise<void> => {
    // Add a machine manually:
    const machineryIdx = addressSpace?.getNamespaceIndex('http://opcfoundation.org/UA/Machinery/')
    const machinesFolder = addressSpace?.findNode(`ns=${machineryIdx};i=1001`) as UAObject
    const namespace = addressSpace?.registerNamespace('http://mynewmachinenamespace/UA')
    const myMachine = namespace?.addObject({
        browseName: 'MyMachine',
        organizedBy: machinesFolder,
    })
    const machineryIdentificationType = addressSpace?.findNode(`ns=${machineryIdx};i=1012`) as UAObjectType
    const myMachineIdentification = machineryIdentificationType?.instantiate({
        browseName: 'Identification',
        organizedBy: myMachine,
        optionals: ['Model'], // array of string 
    })
    const manufacturer = myMachineIdentification?.getChildByName('Manufacturer') as UAVariable
    manufacturer?.setValueFromSource({
        dataType: DataType.LocalizedText,
        value: coerceLocalizedText('Manufacturer'),
    })
    const machineComponentsType = addressSpace?.findNode(`ns=${machineryIdx};i=1006`) as UAObjectType
    const myMachineComponents = machineComponentsType?.instantiate({
        browseName: 'Components',
        organizedBy: myMachine,
    })
    // instantiate components here -> organizedBy: myMachineComponents
    const device = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "M1"
    });
    let variable1 = 1;

    // emulate variable1 changing every 500 ms
    setInterval(() => {  variable1+=1; }, 500);

    namespace.addVariable({
        componentOf: device,
        browseName: "MyVariable1",
        dataType: "Double",
        value: {
            get:  () => new Variant({dataType: DataType.Double, value: variable1 })
        }
    });

    let variable2 = 10.0;

namespace.addVariable({

    componentOf: device,

    nodeId: "ns=1;b=1020FFAA", // some opaque NodeId in namespace 4

    browseName: "MyVariable2",

    dataType: "Double",    

    value: {
        get: () => new Variant({dataType: DataType.Double, value: variable2 }),
        set: (variant: { value: string }) => {
            variable2 = parseFloat(variant.value);
            return StatusCodes.Good;
        }
    }
});
}
