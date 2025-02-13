import { v4 as uuidv4 } from 'uuid';

import type { BormSchema, DataField } from '../../src/index';

export const name: DataField = {
  shared: true,
  path: 'name',
  cardinality: 'ONE',
  contentType: 'TEXT',
};

export const description: DataField = {
  shared: true,
  path: 'description',
  contentType: 'TEXT',
  cardinality: 'ONE',
};

export const string: Omit<DataField, 'path'> = {
  cardinality: 'ONE',
  contentType: 'TEXT',
};

export const id: DataField = {
  shared: true,
  path: 'id',
  cardinality: 'ONE',
  default: { type: 'function', value: () => uuidv4() },
  validations: { required: true, unique: true },
  contentType: 'ID',
  rights: ['CREATE'],
};

export const testSchema: BormSchema = {
  entities: {
    Account: {
      idFields: ['id'], // could be a composite key
      defaultDBConnector: { id: 'default', path: 'Account' }, // in the future multiple can be specified in the config file. Either they fetch full schemas or they will require a relation to merge attributes from different databases
      dataFields: [
        { ...id },
        {
          path: 'provider',
          contentType: 'TEXT',
          cardinality: 'ONE',
          rights: ['CREATE', 'UPDATE', 'DELETE'],
        },
      ],
      linkFields: [
        {
          path: 'user',
          cardinality: 'ONE',
          relation: 'User-Accounts',
          plays: 'accounts',
          target: 'role',
        },
      ],
    },
    User: {
      idFields: ['id'], // could be a namecomposite key
      defaultDBConnector: { id: 'default' }, // in the future multiple can be specified in the config file. Either they fetch full schemas or they will require a relation to merge attributes from different databases
      dataFields: [
        { ...id },
        { ...name, rights: ['CREATE', 'UPDATE'] },
        {
          path: 'email',
          cardinality: 'ONE',
          contentType: 'EMAIL',
          validations: { unique: true },
          rights: ['CREATE', 'DELETE', 'UPDATE'],
        },
      ],
      linkFields: [
        {
          path: 'accounts',
          relation: 'User-Accounts',
          cardinality: 'MANY',
          plays: 'user',
          target: 'role',
        },
        {
          path: 'spaces',
          relation: 'Space-User',
          cardinality: 'MANY',
          plays: 'users',
          target: 'role',
        },
        {
          path: 'user-tags',
          relation: 'UserTag',
          cardinality: 'MANY',
          plays: 'users',
          target: 'relation',
        },
      ],
    },
    SuperUser: {
      extends: 'User',
      defaultDBConnector: { id: 'default' },
      dataFields: [
        {
          path: 'power',
          contentType: 'TEXT',
          cardinality: 'ONE',
        },
      ],
    },
    God: {
      extends: 'SuperUser',
      defaultDBConnector: { id: 'default' },
      dataFields: [
        {
          path: 'isEvil',
          contentType: 'BOOLEAN',
          cardinality: 'ONE',
        },
      ],
    },
    Space: {
      idFields: ['id'],
      defaultDBConnector: { id: 'default' },
      dataFields: [{ ...id }, { ...name, rights: ['CREATE', 'UPDATE'] }],
      linkFields: [
        {
          path: 'users',
          cardinality: 'MANY',
          relation: 'Space-User',
          plays: 'spaces',
          target: 'role',
        },
        {
          path: 'objects',
          cardinality: 'MANY',
          relation: 'SpaceObj',
          plays: 'space',
          target: 'relation',
        },
        {
          path: 'definitions',
          cardinality: 'MANY',
          relation: 'SpaceDef',
          plays: 'space',
          target: 'relation',
        },
        {
          path: 'kinds',
          cardinality: 'MANY',
          relation: 'Kind',
          plays: 'space',
          target: 'relation',
        },
        {
          path: 'fields',
          cardinality: 'MANY',
          relation: 'Field',
          plays: 'space',
          target: 'relation',
        },
        {
          path: 'dataFields',
          cardinality: 'MANY',
          relation: 'DataField',
          plays: 'space',
          target: 'relation',
        },
      ],
    },
    Color: {
      idFields: ['id'],
      defaultDBConnector: { id: 'default' },
      dataFields: [
        { ...id },
        /* todo: test ids different than 'id' {
          path: 'name',
          cardinality: 'ONE',
          validations: { required: true, unique: true },
          contentType: 'TEXT',
          rights: ['CREATE'],
        }, */
      ],
      linkFields: [
        {
          path: 'user-tags',
          cardinality: 'MANY',
          relation: 'UserTagGroup',
          plays: 'color',
          target: 'role',
        },
        {
          path: 'group',
          target: 'relation',
          cardinality: 'ONE',
          plays: 'color',
          relation: 'UserTagGroup',
        },
      ],
    },
  },
  relations: {
    'User-Accounts': {
      idFields: ['id'],
      defaultDBConnector: { id: 'default', path: 'User-Accounts' },
      // defaultDBConnector: { id: 'tdb', path: 'User·Account' }, //todo: when Dbpath != relation name
      dataFields: [{ ...id }],
      roles: {
        accounts: {
          cardinality: 'MANY',
        },
        user: {
          cardinality: 'ONE',
        },
      },
    },
    'Space-User': {
      idFields: ['id'],
      defaultDBConnector: { id: 'default', path: 'Space-User' },
      dataFields: [{ ...id }],
      roles: {
        spaces: { cardinality: 'MANY' },
        users: { cardinality: 'MANY' },
      },
    },
    UserTag: {
      idFields: ['id'],
      defaultDBConnector: { id: 'default', path: 'UserTag' },
      dataFields: [{ ...id }, { ...name }],
      roles: {
        users: {
          cardinality: 'MANY',
        },
      },
      linkFields: [
        {
          path: 'color',
          target: 'role',
          cardinality: 'ONE',
          plays: 'tags',
          relation: 'UserTagGroup',
        },
        {
          path: 'group',
          target: 'relation',
          cardinality: 'ONE',
          plays: 'tags',
          relation: 'UserTagGroup',
        },
      ],
    },
    UserTagGroup: {
      idFields: ['id'],
      defaultDBConnector: { id: 'default', path: 'UserTagGroup' },
      dataFields: [{ ...id }],
      roles: {
        tags: {
          cardinality: 'MANY',
        },
        color: {
          cardinality: 'ONE',
        },
      },
    },
    SpaceObj: {
      idFields: ['id'],
      defaultDBConnector: { id: 'default', path: 'SpaceObj' }, // in the future multiple can be specified in the config file. Either they fetch full schemas or they will require a relation to merge attributes from different databases
      dataFields: [id],
      roles: {
        space: {
          cardinality: 'ONE',
        },
      },
    },
    SpaceDef: {
      extends: 'SpaceObj',
      defaultDBConnector: { id: 'default', as: 'SpaceObj', path: 'SpaceDef' }, // in the future multiple can be specified in the config file. Either they fetch full schemas or they will require a relation to merge attributes from different databases
      dataFields: [description],
    },
    Kind: {
      extends: 'SpaceDef',
      dataFields: [{ ...string, path: 'name', rights: ['CREATE', 'UPDATE'] }],
      linkFields: [
        {
          path: 'fields',
          relation: 'Field',
          cardinality: 'MANY',
          plays: 'kinds',
          target: 'role',
        },
        {
          path: 'dataFields',
          relation: 'DataField',
          cardinality: 'MANY',
          plays: 'kinds',
          target: 'role',
        },
      ],
      defaultDBConnector: { id: 'default', as: 'SpaceDef', path: 'Kind' }, // in the future multiple can be specified in the config file. Either they fetch full schemas or they will require a relation to merge attributes from different databases
    },
    Field: {
      extends: 'SpaceDef',
      dataFields: [
        { ...string, path: 'name' },
        { ...string, path: 'cardinality' },
      ],
      roles: {
        kinds: {
          cardinality: 'MANY',
        },
      },
      defaultDBConnector: { id: 'default', as: 'SpaceDef', path: 'Field' }, // in the future multiple can be specified in the config file. Either they fetch full schemas or they will require a relation to merge attributes from different databases
    },
    DataField: {
      extends: 'Field',
      dataFields: [
        { ...string, path: 'type' },
        { ...string, path: 'computeType' },
      ],
      defaultDBConnector: { id: 'default', as: 'Field', path: 'DataField' }, // in the future multiple can be specified in the config file. Either they fetch full schemas or they will require a relation to merge attributes from different databases
    },
  },
};
