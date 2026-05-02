import Docker from "dockerode";

const docker = new Docker();

export const handleContainerCreate = async (
  projectId,
  terminalSocket,
  req,
  tcpSocket,
  head,
) => {
  try {
    const existingContainer = await docker.listContainers({
      all: true,
      filters: JSON.stringify({ name: [`^/${projectId}$`] }),
    });

    if (existingContainer.length > 0) {
      const container = docker.getContainer(existingContainer[0].Id);
      const containerInfo = await container.inspect();
      if (containerInfo.State.Running) {
        return container;
      }
      // If it exists but is not running, remove it and create a new one (or just start it, but remove is safer for clean state)
      await container.remove({ force: true });
    }

    const sandboxImageName = process.env.SANDBOX_IMAGE || "sandbox";
    
    const container = await docker.createContainer({
      Image: sandboxImageName,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ["/bin/bash"],
      Tty: true,
      name: projectId,
      User: "sandbox",
      Volumes: {
        "/home/sandbox/app": {},
      },
      ExposedPorts: {
        "5173/tcp": {},
      },
      Env: ["HOST=0.0.0.0"],
      HostConfig: {
        Binds: [
          // mounting the project directory to the container
          `${process.env.HOST_PROJECT_PATH || process.cwd()}/projects/${projectId}:/home/sandbox/app`,
        ],
        PortBindings: {
          "5173/tcp": [
            {
              HostPort: "0", // random port will be assigned by docker
            },
          ],
        },
      },
    });

    await container.start();

    return container;
  } catch (error) {
    throw new Error(`Failed to create or start container for project ${projectId}: ${error.message}`);
  }

};
export async function getContainerPort(containerName) {
    const container = await docker.listContainers({
        filters: JSON.stringify({ name: [`^/${containerName}$`] })
    });

    if (container.length > 0) {
        const containerInfo = await docker.getContainer(container[0].Id).inspect();
        try {
            return containerInfo?.NetworkSettings?.Ports["5173/tcp"][0].HostPort;
        } catch (error) {
            return undefined;
        }
    }
    return undefined;
}
