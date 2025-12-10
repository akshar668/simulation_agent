// Simulation Types
export enum EquipmentType {
    ROBOT_ARM = 'ROBOT_ARM',
    CONVEYOR = 'CONVEYOR',
    AGV = 'AGV', // Automated Guided Vehicle
    CNC_MACHINE = 'CNC_MACHINE',
    STORAGE_RACK = 'STORAGE_RACK'
}

export interface SimulationEntity {
    id: string;
    type: EquipmentType;
    position: [number, number, number];
    rotation?: [number, number, number];
    status: 'idle' | 'active' | 'error';
    name: string;
}

export interface SimulationConfig {
    title: string;
    description: string;
    entities: SimulationEntity[];
}

// Service Types
export interface GeneratedImage {
    url: string;
    mimeType: string;
}

export interface GeneratedVideo {
    uri: string;
}

// Window augmentation for AI Studio key selection
declare global {
  // The environment already defines 'aistudio' on Window with type 'AIStudio'.
  // We declare the interface here to ensure it has the methods we need.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  // Shim for React Three Fiber intrinsic elements if they are not correctly augmented by the environment
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}