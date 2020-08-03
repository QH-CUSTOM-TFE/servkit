export const STRING_VALUE = 'servkit';
export const STRING_VALUE1 = 'servkit1';
export const OBJECT_VALUE = { value: STRING_VALUE };
export const OBJECT_VALUE1 = { value: STRING_VALUE1 };

export const delay = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};
