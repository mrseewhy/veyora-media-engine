import {Config} from '@remotion/cli/config';

Config.setEntryPoint('remotion/index.ts');
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
Config.setDelayRenderTimeoutInMilliseconds(120_000);
