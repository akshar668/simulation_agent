import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Box, Cylinder, Sphere } from '@react-three/drei';
import { SimulationConfig, EquipmentType, SimulationEntity } from '../types';
import * as THREE from 'three';

// --- Individual 3D Asset Components ---

const RobotArm = ({ position, status }: { position: [number, number, number], status: string }) => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (status === 'active' && group.current) {
            // Simple animation for active robots
            group.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.5;
        }
    });

    return (
        <group position={position} ref={group}>
            {/* Base */}
            <Cylinder args={[0.5, 0.7, 0.5, 32]} position={[0, 0.25, 0]}>
                <meshStandardMaterial color={status === 'active' ? "#22c55e" : "#fbbf24"} />
            </Cylinder>
            {/* Arm Segment 1 */}
            <Box args={[0.3, 1.5, 0.3]} position={[0, 1.25, 0]}>
                 <meshStandardMaterial color="#64748b" />
            </Box>
            {/* Joint */}
            <Sphere args={[0.4]} position={[0, 2, 0]}>
                <meshStandardMaterial color="#475569" />
            </Sphere>
            {/* Arm Segment 2 */}
            <Box args={[1.2, 0.2, 0.2]} position={[0.6, 2, 0]}>
                 <meshStandardMaterial color="#64748b" />
            </Box>
             <Text position={[0, 3, 0]} fontSize={0.3} color="white">Robot</Text>
        </group>
    );
};

const ConveyorBelt = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
    // Safety check: ensure rotation is a valid array of 3 numbers
    const safeRotation: [number, number, number] = (Array.isArray(rotation) && rotation.length === 3) 
        ? rotation 
        : [0, 0, 0];

    return (
        <group position={position} rotation={safeRotation}>
            <Box args={[4, 0.2, 1]}>
                <meshStandardMaterial color="#334155" />
            </Box>
            {/* Legs */}
            <Box args={[0.1, 1, 0.1]} position={[-1.8, -0.5, 0.4]} material-color="#94a3b8" />
            <Box args={[0.1, 1, 0.1]} position={[1.8, -0.5, 0.4]} material-color="#94a3b8" />
            <Box args={[0.1, 1, 0.1]} position={[-1.8, -0.5, -0.4]} material-color="#94a3b8" />
            <Box args={[0.1, 1, 0.1]} position={[1.8, -0.5, -0.4]} material-color="#94a3b8" />
             <Text position={[0, 1, 0]} fontSize={0.3} color="white">Conveyor</Text>
        </group>
    );
};

const AGV = ({ position, status }: { position: [number, number, number], status: string }) => {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (status === 'active' && mesh.current) {
            mesh.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5) * 2;
        }
    });

    return (
        <group position={position}>
            <Box ref={mesh} args={[1, 0.5, 1.5]} position={[0, 0.25, 0]}>
                <meshStandardMaterial color={status === 'active' ? "#3b82f6" : "#94a3b8"} />
            </Box>
            <Text position={[0, 1, 0]} fontSize={0.3} color="white">AGV</Text>
        </group>
    );
};

const GenericMachine = ({ position, type, name }: { position: [number, number, number], type: string, name: string }) => {
    return (
        <group position={position}>
             <Box args={[2, 2, 2]} position={[0, 1, 0]}>
                <meshStandardMaterial color="#475569" wireframe={false} />
            </Box>
            <Text position={[0, 2.5, 0]} fontSize={0.3} color="white">{name}</Text>
        </group>
    );
};

// --- Main Scene Component ---

const EntityRenderer = ({ entity }: { entity: SimulationEntity }) => {
    // Critical safety check: If position is malformed, do not render to avoid ThreeJS crash
    if (!entity.position || !Array.isArray(entity.position) || entity.position.length !== 3) {
        return null;
    }

    switch (entity.type) {
        case EquipmentType.ROBOT_ARM:
            return <RobotArm position={entity.position} status={entity.status} />;
        case EquipmentType.CONVEYOR:
            return <ConveyorBelt position={entity.position} rotation={entity.rotation} />;
        case EquipmentType.AGV:
            return <AGV position={entity.position} status={entity.status} />;
        default:
            return <GenericMachine position={entity.position} type={entity.type} name={entity.name} />;
    }
};

interface ThreeSceneProps {
    config: SimulationConfig | null;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ config }) => {
    return (
        <div className="w-full h-[500px] bg-black rounded-lg overflow-hidden relative shadow-2xl border border-gray-700">
            {!config && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10 pointer-events-none">
                    <p>No simulation loaded. Describe your process to begin.</p>
                </div>
            )}
            <Canvas camera={{ position: [8, 8, 8], fov: 50 }} shadows>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                <Grid infiniteGrid fadeDistance={50} sectionColor="#4f46e5" cellColor="#374151" />
                <OrbitControls makeDefault />

                {config?.entities.map((entity) => (
                    <EntityRenderer key={entity.id} entity={entity} />
                ))}
            </Canvas>
        </div>
    );
};

export default ThreeScene;